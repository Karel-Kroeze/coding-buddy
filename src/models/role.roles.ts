import { User } from "../authorization";
import { Request } from "express";
import { Role, IRole } from "./role.model";

User.entity("role", async (req: Request, done: any) => {
    try {
        let match = req.originalUrl.match(/\/roles\/(\w+)\/?/);
        if (!match) {
            return done(new Error(`Expected url like '/role/:id'.`));
        }
        let role = await Role.findById(match[1]);
        if (!role) {
            return done(new Error(`role not found.`));
        }
        return done(null, role);
    } catch (err) {
        return done(err);
    }
});

User.role("role.owner", async (role: IRole, req: Request, done: any) => {
    if (!req.user || !role) {
        return done();
    } else {
        try {
            await role.populate("dataset");
            return done(null, role.dataset.owner === req.user.id);
        } catch (err) {
            return done(err);
        }
    }
});

User.action("create role", ["admin", "authenticated"]);
User.action("view role", ["admin", "authenticated"]);
User.action("edit role", ["admin", "role.owner"]);
User.action("delete role", ["admin", "role.owner"]);
