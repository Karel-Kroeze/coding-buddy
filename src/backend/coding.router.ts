import { Router } from "express";
import { Types } from "mongoose";

import { User } from "../authorization";
import { randomElement } from "../helpers";
import { Artifact, IArtifact } from "../models/artifact.model";
import { Code, ICode } from "../models/code.model";
import { CriteriumResponse } from "../models/criteriumResponse.model";
import { DataSet, DataSetDocument } from "../models/dataset.model";
import { Mark } from "../models/mark.model";
import { ERole } from "../models/role.enum";

export const CodingRouter = Router();
let router = CodingRouter;

router.get("/", User.can("list datasets"), async (req, res) => {
    try {
        const user = req.user!;
        const datasets = (await DataSet.find({})) as DataSetDocument[];
        await Promise.all(datasets.map((ds) => ds.getProgress()));
        await Promise.all(datasets.map((ds) => ds.getMarks()));
        res.render("coding/index", {
            datasets: datasets.filter(
                async (ds) => ds.coding && await user.role(ds) >= ERole.view
            ),
            baseUrl: req.baseUrl,
        });
    } catch (err) {
        req.message(`Error: ${err}`);
        console.log(err);
        res.redirect(req.baseUrl);
    }
});

router.get(
    "/dataset/:datasetId",
    User.can("view dataset"),
    async (req, res) => {
        try {
            let dataset = (await DataSet.findById(
                req.params.datasetId
            ).populate("criteria")) as DataSetDocument | null;
            if (!dataset) throw "DataSet not found";
            let artifacts: IArtifact[] = await Artifact.aggregate([
                { $match: { dataset: new Types.ObjectId(dataset.id) } },
                {
                    $project: {
                        content: true,
                        dataset: true,
                        codes: true,
                        id: "$_id",
                        numCodes: { $size: "$codes" },
                    },
                },
                { $sort: { numCodes: 1 } },
                { $limit: 5 },
            ]);
            await Code.populate(artifacts, [{ path: "codes" }]);
            artifacts = artifacts.filter(
                (artifact) =>
                    !artifact.codes ||
                    !artifact.codes.some((code) => code.coder == req.user!.id)
            );
            let artifact = randomElement(artifacts);
            if (!artifact) {
                req.message(
                    "info",
                    "You have already coded all the documents in this dataset"
                );
                res.redirect(req.baseUrl);
                return;
            }
            let progress = await dataset.getProgress();
            console.log({ artifact, progress });
            res.render("coding/code", {
                dataset,
                artifact,
                progress,
                baseUrl: req.baseUrl,
            });
        } catch (err) {
            req.message(`Error: ${err}`);
            res.redirect(req.baseUrl);
        }
    }
);

router.get(
    "/marks/dataset/:datasetId/:markId",
    User.can("view dataset"),
    async (req, res) => {
        try {
            const dataset = await DataSet.findById(req.params.datasetId);
            if (!dataset) throw "dataset not found";
            const mark = await Mark.findById(req.params.markId);
            if (!mark) throw "mark not found";
            const marks = await Mark.find({ dataset: dataset.id });
            const index = marks.findIndex((m) => m.id == mark.id);
            const artifact = await Artifact.findById(mark.artifact);
            if (!artifact) throw "artifact not found";
            const code = mark.code ? await Code.findById(mark.code) : false;

            const data = {
                artifact,
                dataset,
                mark,
                code,
                baseUrl: req.baseUrl,
                path: "/marks/dataset/",
                previous: index > 0 ? marks[index - 1].id : undefined,
                next:
                    index < marks.length - 1 ? marks[index + 1].id : undefined,
            };
            res.render("coding/view", data);
        } catch (err) {
            console.error(err);
            req.message(`Error: ${err}`);
            // res.redirect( req.baseUrl );
        }
    }
);

router.get(
    "/codes/dataset/:datasetId/:codeId/delete",
    User.can("admin dataset"),
    async (req, res) => {
        try {
            const dataset = await DataSet.findById(req.params.datasetId)
                .populate({
                    path: "artifacts",
                    select: "codes",
                })
                .exec();
            if (!dataset) throw "dataset not found";
            const code = await Code.findById(req.params.codeId).exec();
            if (!code) throw "code not found";

            await code.remove();
            req.message("success", `Code ${code.id} deleted`);

            const codes = dataset.artifacts.reduce(
                (acc: ICode[], cur) => acc.concat(cur.codes),
                []
            );
            const index = codes.findIndex((c) => c == code.id);
            if (index < codes.length - 1)
                res.redirect(
                    `${req.baseUrl}/codes/dataset/${dataset.id}/${
                        codes[index + 1]._id
                    }`
                );
            else res.redirect(`/datasets/${dataset.id}`);
        } catch (err) {
            console.error({ err });
            req.message(`Error: ${err}`);
            res.redirect(`/datasets`);
        }
    }
);

router.get(
    "/codes/dataset/:datasetId/:codeId",
    User.can("edit dataset"),
    async (req, res) => {
        try {
            const dataset = await DataSet.findById(req.params.datasetId)
                .populate({
                    path: "artifacts",
                    select: "codes",
                })
                .exec();
            if (!dataset) throw "dataset not found";
            const code = await Code.findById(req.params.codeId)
                .populate({
                    path: "criteria",
                    model: "CriteriumResponse",
                    populate: {
                        path: "criterium",
                        model: "Criterium",
                    },
                })
                .exec();
            if (!code) throw "code not found";
            const codes = dataset.artifacts.reduce(
                (acc: ICode[], cur) => acc.concat(cur.codes),
                []
            );
            console.log({ codes });
            const index = codes.findIndex((c) => c == code.id);
            const artifact = await Artifact.findById(code.artifact);
            if (!artifact) throw "artifact not found";

            const data = {
                artifact,
                dataset,
                code,
                baseUrl: req.baseUrl,
                path: "/codes/dataset/",
                previous: index > 0 ? codes[index - 1] : undefined,
                next: index < codes.length - 1 ? codes[index + 1] : undefined,
            };
            console.log({ artifact });
            res.render("coding/view", data);
        } catch (err) {
            console.error({ err });
            req.message(`Error: ${err}`);
            res.redirect(`/datasets`);
        }
    }
);

router.post(
    "/dataset/:datasetId/:artifactId",
    User.can("view dataset"),
    async (req, res) => {
        try {
            let artifact = await Artifact.findById(req.params.artifactId);
            if (!artifact) throw "Artifact not found!";
            let dataset = (await DataSet.findById(
                req.params.datasetId
            ).populate("criteria")) as DataSetDocument | null;
            if (!dataset) throw "DataSet not found!";
            if (artifact.dataset != dataset.id)
                throw "DataSet id's don't match!";
            let code = new Code({ coder: req.user, artifact: artifact.id });
            for (const criterium of dataset.criteria) {
                let value = req.body[criterium.label];
                if (criterium.type == "open") {
                    let changed = false;
                    if (value) {
                        if (typeof value === "string") {
                            // single answer.
                            if (
                                !criterium.options!.find(
                                    (o) => o.label == value
                                )
                            ) {
                                criterium.options!.push({ label: value });
                                changed = true;
                            }
                        } else {
                            // multiple answers.
                            for (const option of value) {
                                if (
                                    !criterium.options!.find(
                                        (o) => o.label == option
                                    )
                                ) {
                                    criterium.options!.push({ label: option });
                                    changed = true;
                                }
                            }
                        }
                    }
                    if (changed) criterium.save();
                } else {
                    if (typeof value === "undefined")
                        throw `No response for '${criterium.label}'`;
                }
                let response = await new CriteriumResponse({
                    criterium: criterium.id,
                    value,
                }).save();
                code.criteria.push(response);
            }

            await code.save();
            artifact.codes.push(code);
            await artifact.save();
        } catch (err) {
            req.message(`Error: ${err}`);
        } finally {
            res.redirect(`${req.baseUrl}/dataset/${req.params.datasetId}`);
        }
    }
);

router.post("/mark", async (req, res) => {
    if (!req.user) return res.status(401).send("not authenticated");
    let artifact = await Artifact.findById(req.body.artifact);
    if (!artifact) return res.status(400).send("artifact not found");
    if (!req.user.can(ERole.view, artifact.dataset))
        return res.status(401).send("not authorized");
    const data = {
        coder: req.user.id,
        artifact: artifact.id,
        dataset: artifact.dataset,
    };
    const mark = await Mark.findOne(data);
    if (mark) return res.status(400).send("already marked");
    await Mark.create(data);
    return res.status(200).send("artifact marked");
});
