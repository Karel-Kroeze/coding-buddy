import { IPerson, Person, PersonDocument } from "../models/person.model";
import { Request, Response } from "express";

// TODO: Check permissions!

export class PersonController {
    async create(req: Request, res: Response) {
        console.log("persons.create");
        try {
            res.json(await new Person(req.body).save());
        } catch (error) {
            res.status(500).json(error);
        }
    }

    async find(req: Request, res: Response) {
        console.log("persons.find");
        try {
            res.json(await Person.findById(req.params.personId).exec());
        } catch (error) {
            res.status(500).json(error);
        }
    }

    async list(req: Request, res: Response) {
        console.log("persons.list");
        try {
            res.json(await Person.find({}));
        } catch (error) {
            res.status(500).json(error);
        }
    }

    async update(req: Request, res: Response) {
        console.log("persons.update");
        try {
            const person = (await Person.findById(
                req.params.personId
            )) as PersonDocument;
            if (!person) throw "User not found";

            const { name, email, password } = req.body as Partial<IPerson>;
            if (name) person.name = name;
            if (email) person.email = email;
            if (password) await person.setPassword(password);
            const result = await person.save();

            req.message("success", "User updated");

            res.json(result);
        } catch (error) {
            req.message("danger", `${error}`);
            res.status(500).json(error);
        }
    }

    async delete(req: Request, res: Response) {
        console.log("persons.delete");
        try {
            res.json(await Person.findByIdAndDelete(req.params.personId));
        } catch (error) {
            res.status(500).json(error);
        }
    }
}

export const personController = new PersonController();
