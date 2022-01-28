import { User } from "../authorization";
import { Request } from "express";
import { Code, ICode } from "./code.model";

User.entity("code", async (req: Request, done: any) => {
    try {
        let match = req.originalUrl.match(/\/codes\/(\w+)\/?/);
        if (!match) {
            return done(new Error(`Expected url like '/code/:id'.`));
        }
        let code = await Code.findById(match[1]);
        if (!code) {
            return done(new Error(`code not found.`));
        }
        return done(null, code);
    } catch (err) {
        return done(err);
    }
});

User.role("code.owner", async (code: ICode, req: Request, done: any) => {
    if (!req.user || !code) {
        return done();
    } else {
        try {
            await code.populate("artifact.dataset");
            return done(null, code.artifact.dataset.owner === req.user.id);
        } catch (err) {
            return done(err);
        }
    }
});

User.action("create code", ["admin", "authenticated"]);
User.action("view code", ["admin", "authenticated"]);
User.action("edit code", ["admin", "code.owner"]);
User.action("delete code", ["admin", "code.owner"]);
