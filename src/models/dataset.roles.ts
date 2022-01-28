import { User } from "../authorization";
import { Request } from "express";
import { DataSet, IDataSet } from "./dataset.model";
import { ERole } from "./role.enum";
import { IPerson } from "./person.model";

User.entity("dataset", async (req: Request, done: any) => {
    try {
        let match = req.originalUrl.match(/\/datasets?\/(\w+)\/?/);
        if (!match) {
            return done(new Error(`Expected url like '/dataset/:id'.`));
        }
        let dataset = await DataSet.findById(match[1]);
        if (!dataset) {
            return done(new Error(`dataset not found.`));
        }
        return done(null, dataset);
    } catch (err) {
        return done(err);
    }
});

User.role("dataset.owner", (dataset: IDataSet, req: Request, done: any) => {
    try {
        if (!req.user || !dataset) {
            return done(null, false);
        } else {
            return done(null, dataset.owner === req.user.id);
        }
    } catch (err) {
        return done(err);
    }
});

let checkRole = (role: ERole) => {
    return async (
        dataset: IDataSet,
        req: Request,
        done: (err: Error | null, allowed?: boolean) => void
    ) => {
        try {
            console.log(req.user ? req.user.name : "guest");
            if (!req.user) return done(null, false);
            if (!dataset) throw "no dataset found";
            return req.user
                .can(role, dataset)
                .then((allowed) => done(null, allowed))
                .catch((err) => done(err));
        } catch (err: any) {
            console.error(err);
            return done(err);
        }
    };
};
User.role("dataset.admin", checkRole(ERole.admin));
User.role("dataset.editor", checkRole(ERole.edit));
User.role("dataset.viewer", checkRole(ERole.view));

User.action("create dataset", ["admin", "authenticated"]);
User.action("view dataset", ["admin", "dataset.viewer"]);
User.action("list datasets", ["admin", "authenticated"]);
User.action("edit dataset", ["admin", "dataset.editor"]);
User.action("admin dataset", ["admin", "dataset.admin"]);
User.action("delete dataset", ["admin", "dataset.admin"]);
