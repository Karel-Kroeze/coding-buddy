import { User } from "../authorization";
import { Request } from "express";
import { Person, IPerson, PersonDocument } from "./person.model";

User.entity("person", async (req: Request, done: any) => {
    try {
        let match = req.originalUrl.match(/\/persons\/(\w+)\/?/);
        if (!match) {
            return done(new Error(`Expected url like '/person/:id'.`));
        }
        let person = await Person.findById(match[1]);
        if (!person) {
            return done(new Error(`person not found.`));
        }
        return done(null, person);
    } catch (err) {
        return done(err);
    }
});

User.role("person.self", (person: PersonDocument, req: Request, done: any) => {
    if (!req.user || !person) {
        return done();
    } else {
        return done(null, person.id === req.user.id);
    }
});

User.role(
    "person.affiliated",
    async (person: PersonDocument, req: Request, done: any) => {
        if (!req.user || !person) {
            return done();
        } else {
            // get list of persons that have any role in datasets we created
            // (this is NOT a social platform, we are not allowed to view users we have no relation with)
            // TODO

            // return true if person occurs in that list.
            return done(null, false);
        }
    }
);

User.action("create person", ["admin"]);
User.action("list persons", ["admin", "authenticated"]);
User.action("view person", ["admin", "person.self", "person.affiliated"]);
User.action("edit person", ["admin", "person.self"]);
User.action("delete person", ["admin", "person.self"]);
