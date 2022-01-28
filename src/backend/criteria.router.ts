import { Router } from "express";
import { User } from "../authorization";
import { Criterium } from "../models/criterium.model";

export const CriteriaRouter = Router();
let router = CriteriaRouter;

router.all("/", async (req, res, next) => {
    console.log(JSON.stringify(req.body, null, 4));
    return next();
});

// list
router.get("/", User.can("list criteria"), async (req, res, next) => {
    const user = req.user!;
    let criteria;
    if (user.admin) {
        criteria = await Criterium.find({});
    } else {
        criteria = await Criterium.find({ owner: user.id });
    }
    res.render("criteria/index", { criteria, baseUrl: req.baseUrl });
});

// create
router.get("/new", User.can("create criterium"), async (req, res, next) => {
    res.render("criteria/new", { baseUrl: req.baseUrl });
});

router.post("/", User.can("create criterium"), async (req, res, next) => {
    try {
        const user = req.user!;
        const criterium = new Criterium({ ...req.body, owner: user });
        await criterium.save();
        req.message(
            `success`,
            `Criterium ${criterium.name} created successfully`
        );
    } catch (err) {
        req.message(`Failed to create criterium: ${err}.`);
    } finally {
        res.redirect(req.baseUrl);
    }
});

// edit
router.get(
    "/:criteriumId/edit",
    User.can("edit criterium"),
    async (req, res, next) => {
        try {
            let criterium = await Criterium.findById(req.params.criteriumId);
            if (!criterium) throw "Criterium not found";
            res.render("criteria/edit", { criterium, baseUrl: req.baseUrl });
        } catch (err) {
            req.message(`Can't edit criterium: ${err}.`);
            res.redirect(req.baseUrl);
        }
    }
);

router.patch(
    "/:criteriumId",
    User.can("edit criterium"),
    async (req, res, next) => {
        try {
            let criterium = await Criterium.findById(req.params.criteriumId);
            if (!criterium) throw "Criterium not found";

            // todo; there must be a better way to mass update properties (assign?).
            // note that we can't use findByIdAndUpdate because it doesn't trigger hooks.
            criterium.name = req.body.name;
            criterium.label = req.body.label;
            criterium.desc = req.body.desc;
            criterium.type = req.body.type;
            criterium.min = req.body.min;
            criterium.max = req.body.max;
            criterium.options = req.body.options;
            console.log(req.body);
            await criterium.save();
            req.message(
                `success`,
                `Criterium ${criterium.name} updated successfully`
            );
        } catch (err) {
            req.message(`Failed updating criterium: ${err}.`);
        } finally {
            res.redirect(req.baseUrl);
        }
    }
);

// delete
router.delete(
    "/:criteriumId",
    User.can("delete criterium"),
    async (req, res, next) => {
        try {
            let criterium = await Criterium.findByIdAndDelete(
                req.params.criteriumId
            );
            if (!criterium) throw "Criterium not found";
            req.message(
                `success`,
                `Criterium ${criterium.name} deleted successfully`
            );
        } catch (err) {
            req.message(`Failed deleting criterium: ${err}.`);
        } finally {
            res.redirect(req.baseUrl);
        }
    }
);

// detail
router.get(
    "/:criteriumId",
    User.can("view criterium"),
    async (req, res, next) => {
        try {
            let criterium = await Criterium.findById(req.params.criteriumId);
            if (!criterium) throw "Criterium not found";
            res.render("criteria/detail", { criterium, baseUrl: req.baseUrl });
        } catch (err) {
            req.message(`Failed view criterium details: ${err}.`);
            res.redirect(req.baseUrl);
        }
    }
);
