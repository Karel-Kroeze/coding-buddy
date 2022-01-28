import { User } from "../authorization";
import { Request } from "express";
import { CriteriumResponse } from "./criteriumResponse.model";

User.entity("criteriumResponse", async (req: Request, done: any) => {
    try {
        let match = req.originalUrl.match(/\/criteriumResponses\/(\w+)\/?/);
        if (!match) {
            return done(
                new Error(`Expected url like '/criteriumResponse/:id'.`)
            );
        }
        let criteriumResponse = await CriteriumResponse.findById(match[1]);
        if (!criteriumResponse) {
            return done(new Error(`criteriumResponse not found.`));
        }
        return done(null, criteriumResponse);
    } catch (err) {
        return done(err);
    }
});

User.action("create criteriumResponse", ["admin", "authenticated"]);
User.action("view criteriumResponse", ["admin", "authenticated"]);
User.action("edit criteriumResponse", ["admin"]);
User.action("delete criteriumResponse", ["admin"]);
