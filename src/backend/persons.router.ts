import { Router } from "express";
import { User } from "../authorization";
import { Person, PersonDocument } from "../models/person.model";
import { DataSet } from "../models/dataset.model";
import { Role } from "../models/role.model";
import { ERole } from "../models/role.enum";
import mongoose from "mongoose";
import { transporter } from "../mail";

export const PersonRouter = Router();
let router = PersonRouter;

// list
router.get("/", User.can("list persons"), async (req, res) => {
    let persons;
    if (req.user?.admin) {
        persons = await Person.find({});
    } else {
        // TODO: only get persons we have a relation to (ourselves, and those in datasets we are a part of);
        persons = [req.user];
    }
    res.render("persons/index", {
        title: "Persons",
        baseUrl: req.baseUrl,
        persons,
    });
});

// create
router.get("/new", User.can("create person"), async (req, res) => {
    const user = req.user!;
    let datasets = await DataSet.find({ owner: user.id });
    res.render("persons/new", { title: "Add person", datasets });
});

router.post("/", User.can("create person"), async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = req.user!;
        let admin = user.admin ? req.body.admin : false;
        let person = new Person({
            name,
            email,
            admin,
            roles: [],
        }) as PersonDocument;
        for (let datasetId in req.body.datasets) {
            // check if user has auth for this dataset
            if (
                await user.can(
                    ERole.admin,
                    new mongoose.Types.ObjectId(datasetId)
                )
            ) {
                console.log({
                    raw: req.body.datasets[datasetId],
                    role: ERole[req.body.datasets[datasetId]],
                });
                await new Role({
                    person: person.id,
                    dataset: datasetId,
                    role: ERole[req.body.datasets[datasetId]],
                }).save();
            }
        }

        const password = Person.generatePassword();
        await person.setPassword(password);
        await person.save();

        transporter.sendMail({
            to: person.email,
            subject: "New account",
            text: `An account was created for you on Coding Buddy (https://coding.home.karel-kroeze.nl)\n\nUsername: ${person.email}\nPassword: ${password}`,
        });
        req.message(
            "success",
            `Succesfully created an account for "${person.name}" (${person.email})`
        );
        res.redirect(req.baseUrl);
    } catch (err) {
        req.message(`Failed adding person: ${err}`);
        res.redirect(req.header("Referer") || `${req.baseUrl}/new`);
    }
});

// update
router.get("/:personId/edit", User.can("edit person"), async (req, res) => {
    const person = (await Person.findById(
        req.params.personId
    )) as PersonDocument;
    const user = req.user!;
    let roles, datasets;
    if (person && person !== req.user) {
        datasets = await DataSet.find({ owner: user.id });
        roles = await Promise.all(
            datasets.map(async (ds) => {
                return person!.roleString(ds);
            })
        );
    }
    console.log({ person, datasets, roles });
    res.render("persons/edit", { person, datasets, roles });
});

router.get("/test", async (req, res) => {
    let roles = await Role.find({}).populate(["person"]);
    let datasets = await DataSet.find({});
    let users = (await Person.find({})) as PersonDocument[];
    let roles2: any = {};
    for (const user of users) {
        roles2[user.name] = {};
        for (const dataset of datasets) {
            roles2[user.name][dataset.name] = {
                raw: await Role.find({ person: user.id, dataset: dataset.id }),
                clean: await user.roleString(dataset),
            };
        }
    }
    res.json({ roles, roles2 });
});

router.patch("/:personId", User.can("edit person"), async (req, res) => {
    try {
        const user = req.user!;
        const person = await Person.findById(req.params.personId);
        if (!person) throw "Person not found";

        person.name = req.body.name;
        person.email = req.body.email;

        if (user.admin && user.id !== person.id) {
            person.admin = req.body.admin;
        }
        if (user.id === person.id) {
            // can't change your own admin status
            person.admin = user.admin;
        }

        for (const dataset in req.body.datasets) {
            let role = req.body.datasets[dataset];
            await Role.findOneAndUpdate(
                { person: person.id, dataset: dataset },
                { role: ERole[role] },
                { upsert: true }
            );
        }
        await person.save();
        req.message("success", `${person.name} updated`);
    } catch (err) {
        req.message(`Could not update person: ${err}`);
    }
    res.redirect(req.baseUrl);
});

router.get(
    "/:personId/resetPassword",
    User.can("edit person"),
    async (req, res) => {
        try {
            const user = req.user!;
            const person = (await Person.findById(
                req.params.personId
            )) as PersonDocument;
            if (!person) throw "Person not found";

            const password = Person.generatePassword();
            console.log({ password });
            await person.setPassword(password);
            transporter.sendMail({
                to: person.email,
                subject: "password reset",
                text: `Hi ${person.name},\n\nYour password was reset.\nYour new password is: ${password}\n\nStay safe!`,
            });
            await person.save();
            req.message(
                "info",
                `Password reset for ${person.name} (${person.email})`
            );
        } catch (err) {
            req.message(`Could not update person: ${err}`);
        }
        res.redirect(req.baseUrl);
    }
);

// delete
router.delete("/:personId", User.can("delete person"), async (req, res) => {
    try {
        let person = await Person.findById(req.params.personId);
        if (!person) throw "Person not found.";
        await person.remove();
        req.message("success", `${person.name} deleted`);
    } catch (err) {
        req.message(`Could not delete person: ${err}`);
    }
    res.redirect(req.baseUrl);
});

// detail
router.get("/:personId", User.can("view person"), async (req, res) => {
    try {
        let person = await Person.findById(req.params.personId);
        if (!person) throw "Person not found.";
        res.render("persons/detail", { person, baseUrl: req.baseUrl });
    } catch (err) {
        req.message(`Could not find person: ${err}`);
        res.redirect(req.baseUrl);
    }
});
