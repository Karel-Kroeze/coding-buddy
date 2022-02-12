import { Router } from "express";
import fs from "mz/fs";

import { User } from "../authorization";
import { Artifact, IArtifact } from "../models/artifact.model";
import { Code } from "../models/code.model";
import { Criterium } from "../models/criterium.model";
import { DataSet, DataSetDocument } from "../models/dataset.model";
import { Person, PersonDocument } from "../models/person.model";
import { ERole } from "../models/role.enum";
import { Role } from "../models/role.model";
import { upload } from "../upload";

export const DataSetRouter = Router();
let router = DataSetRouter;

// list
router.get("/", User.can("list datasets"), async (req, res) => {
    const user = req.user!;
    const docs = (await DataSet.find({})
        .populate("criteria")
        .exec()) as DataSetDocument[];
    let datasets = docs.filter(async (doc) => await user.role(doc) >= ERole.view);
    res.render("datasets/index", {
        title: "DataSets",
        datasets,
        baseUrl: req.baseUrl,
    });
});

// edit
router.get("/:datasetId/edit", User.can("edit dataset"), async (req, res) => {
    let dataset = await DataSet.findById(req.params.datasetId);
    let criteria = await Criterium.find({});
    let persons = (await Person.find({})) as PersonDocument[];
    let roles = await Promise.all(persons.map((p) => p.roleString(dataset!)));

    // sort criteria by order of appearance in dataset list
    criteria.sort(
        (a, b) =>
            dataset!.criteria.indexOf(a.id) - dataset!.criteria.indexOf(b.id)
    );

    res.render("datasets/edit", { dataset, criteria, persons, roles });
});

router.patch("/:datasetId", User.can("edit dataset"), async (req, res) => {
    try {
        const user = req.user!;
        const dataset = await DataSet.findById(req.params.datasetId);
        if (!dataset) throw "DataSet not found";
        const { name, desc, type, criteria, permissions, template } = req.body;
        dataset.name = name;
        dataset.desc = desc;
        dataset.type = type;
        dataset.template = template;
        dataset.criteria = criteria;
        await dataset.save();
        console.log({ dataset });

        if ((await user.can("admin", dataset)) && permissions) {
            for (const person in permissions) {
                const role = permissions[person];
                new Role({ person, dataset, role });
            }
        }

        req.message("success", `DataSet ${dataset.name} updated succesfully.`);
        res.redirect(req.baseUrl);
    } catch (err) {
        req.message(`Failed updating DataSet: ${err}.`);
        res.redirect(req.header("Referer") || `${req.baseUrl}/new`);
    }
});

// create
router.get("/new", User.can("create dataset"), async (req, res) => {
    let criteria = await Criterium.find({});
    let persons = await Person.find({});
    res.render("datasets/new", { criteria, persons });
});

router.post(
    "/",
    User.can("create dataset"),
    upload.single("artifacts"),
    async (req, res, next) => {
        let { name, desc, type, criteria, permissions } = req.body;
        let file = req.file;
        try {
            let dataset = new DataSet({
                name,
                desc,
                type,
                criteria,
                owner: req.user,
            });

            if (permissions) {
                for (const person in permissions) {
                    const role = permissions[person];
                    let _ = await new Role({ person, dataset, role });
                }
            }

            if (file) {
                // read in artifacts from file.
                let artifactsData: IArtifact[];
                try {
                    artifactsData = JSON.parse(
                        await fs.readFile(file.path, "utf-8")
                    );
                } catch (err) {
                    console.error(err);
                    throw "Artifacts must be valid JSON";
                }

                // create artifact documents.
                if (!Array.isArray(artifactsData))
                    throw "Artifacts must be in a JSON array";

                let artifacts = await Promise.all(
                    await artifactsData.map((content: IArtifact) =>
                        new Artifact({ dataset: dataset.id, content }).save()
                    )
                );

                // attach documents to dataset and save
                dataset.artifacts.push(...artifacts);
            }
            await dataset.save();

            req.message(
                "success",
                `DataSet ${dataset.name} created successfully.`
            );
            res.redirect(req.baseUrl);
        } catch (err) {
            console.log(err);
            req.message(`Failed creating dataset: ${err}`);
            res.redirect(req.header("Referer") || `${req.baseUrl}/new`);
        } finally {
            // we need to remove the uploaded file.
            if (file) await fs.unlink(file.path);
        }
    }
);

// delete
router.delete("/:datasetId", User.can("delete dataset"), async (req, res) => {
    try {
        let dataset = await DataSet.findByIdAndDelete(req.params.datasetId);
        if (!dataset) throw "DataSet not found";
        req.message("success", `DataSet ${dataset.name} deleted successfully`);
    } catch (err) {
        req.message(`Failed deleting dataset: ${err}.`);
    } finally {
        res.redirect(req.baseUrl);
    }
});

// start/stop coding
router.get("/:datasetId/start", async (req, res) => {
    try {
        let dataset = await DataSet.findById(req.params.datasetId);
        if (!dataset) throw "DataSet not found";
        if (!dataset.criteria || !dataset.criteria.length)
            throw `No Criteria set for ${dataset.name}`;
        if (dataset.coding) throw `Already coding ${dataset.name}`;
        if (dataset.completed) throw `Already completed coding ${dataset.name}`;
        dataset.coding = true;
        await dataset.save();
        req.message(`success`, `Coding ${dataset.name} started.`);
    } catch (err) {
        req.message(`Error starting coding: ${err}`);
    } finally {
        // console.log( req.user.name, req.baseUrl );
        res.redirect(req.baseUrl);
    }
});

router.get("/:datasetId/stop", User.can("admin dataset"), async (req, res) => {
    try {
        let dataset = await DataSet.findById(req.params.datasetId);
        if (!dataset) throw "DataSet not found";
        if (!dataset.coding) throw `Not currently coding ${dataset.name}`;
        if (dataset.completed) throw `Already completed coding ${dataset.name}`;
        dataset.completed = true;
        dataset.coding = false;
        await dataset.save();
        req.message(`success`, `Coding ${dataset.name} completed.`);
    } catch (err) {
        req.message(`Error stopping coding: ${err}`);
    } finally {
        res.redirect(req.baseUrl);
    }
});

router.get(
    "/:datasetId/copy",
    User.can("view dataset"),
    User.can("create dataset"),
    async (req, res) => {
        try {
            let dataset = await DataSet.findById(req.params.datasetId)
                .populate("artifacts")
                .lean()
                .exec();
            if (!dataset) throw "DataSet not found";

            // create new dataset with altered label/name, owner, and reset state
            let datasetCopy = new DataSet({
                artifacts: [],
                name: dataset.name + " [Copy]",
                owner: req.user,
                desc: `[Copy of ${dataset.name}]\n\n${dataset.desc}`,
                type: dataset.type,
                coding: false,
                completed: false,
                criteria: [...dataset.criteria],
            });

            // make copies of all artifacts for the new dataset
            let artifacts = await Promise.all(
                dataset.artifacts.map((artifact) =>
                    new Artifact({
                        content: artifact.content,
                        dataset: datasetCopy.id,
                    }).save()
                )
            );
            datasetCopy.artifacts.push(...artifacts);
            await datasetCopy.save();

            // profit?
            req.message(`success`, `Copy '${datasetCopy.name}' created.`);
        } catch (err) {
            console.error(err);
            req.message(`Error copying dataset: ${err}`);
        } finally {
            res.redirect(req.baseUrl);
        }
    }
);

// reset coding (admin purposes, not exposed)
router.get("/:datasetId/reset", User.can("admin dataset"), async (req, res) => {
    try {
        let dataset = await DataSet.findById(req.params.datasetId);
        if (!dataset) throw "DataSet not found";
        dataset.completed = false;
        dataset.coding = false;
        await dataset.save();
        if (req.query.delete) {
            console.log("deleting stuff");
            await Promise.all(
                dataset.artifacts.map(async (artifact) => {
                    await Code.deleteMany({ artifact });
                    await Artifact.findByIdAndUpdate(artifact, {
                        $set: { codes: [] },
                    });
                })
            );
            console.log("deleted stuff");
        }
        req.message(`success`, `Coding ${dataset.name} reset.`);
    } catch (err) {
        req.message(`Error resetting coding: ${err}`);
    } finally {
        res.redirect(req.baseUrl);
    }
});

// download
router.get(
    "/:datasetId/download",
    User.can("admin dataset"),
    async (req, res) => {
        try {
            let artifacts = await Artifact.find({
                dataset: req.params.datasetId,
            })
                .populate({
                    path: "codes",
                    populate: [
                        {
                            path: "coder",
                            select: "_id name",
                        },
                        {
                            path: "criteria",
                            populate: {
                                path: "criterium",
                                select: "_id label name",
                            },
                            select: "_id criteria value",
                        },
                    ],
                })
                .exec();
            var json = JSON.stringify(artifacts, null, 4);
            var filename = "data.json";
            var mimetype = "application/json";
            res.setHeader("Content-Type", mimetype);
            res.setHeader(
                "Content-disposition",
                "attachment; filename=" + filename
            );
            res.send(json);
            res.redirect(req.baseUrl);
        } catch (err) {
            req.message(`Error downloading data: ${err}`);
            res.redirect(req.baseUrl);
        }
    }
);

// detail
router.get("/:datasetId", User.can("view dataset"), async (req, res) => {
    try {
        let dataset = (await DataSet.findById(req.params.datasetId)
            .populate({
                path: "criteria",

            })
            .exec()) as DataSetDocument;
        if (!dataset) throw "dataset not found";
        await dataset.getMarks();
        await dataset.getCodes();
        await dataset.getProgress();

        console.log({ dataset, codes: dataset.codes });
        res.render("datasets/detail", { dataset, baseUrl: req.baseUrl });
    } catch (err) {
        req.message(`Error viewing dataset: ${err}`);
        res.redirect(req.baseUrl);
    }
});
