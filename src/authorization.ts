import authorized from "authorized";
import { Request, Response, NextFunction } from "express";
import { Person, PersonDocument } from "./models/person.model";

export const User: any = authorized;
User.role("admin", (req: Request, done: any) => {
    done(null, req.user && req.user.admin);
});
User.role("authenticated", (req: Request, done: any) => {
    done(null, req.user);
});
User.role("guest", (req: Request, done: any) => {
    done(null, !req.user);
});
require("./models/roles");

export const UnauthorizedHandler = async function (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof User.UnauthorizedError) {
        if (req.accepts("html")) {
            req.message(err.name + ": " + err.message);
            if (process.env.DEBUG) {
                const adminUser = (await Person.findOne({
                    admin: true,
                })) as PersonDocument;
                req.login(adminUser, (_) => {
                    req.message(
                        "warning",
                        `DEBUG: auto logged in as ${adminUser.name}`
                    );
                    res.redirect(req.originalUrl);
                });
            } else {
                res.redirect("/");
            }
        } else {
            res.status(401).send("Unauthorized");
        }
    } else {
        next(err);
    }
};
