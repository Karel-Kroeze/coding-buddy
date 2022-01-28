import { Request, Response } from "express";
import { Person } from "../models/person.model";
import { Criterium } from "../models/criterium.model";

// TODO: Check permissions!

export class CriteriumController {
    async create(req: Request, res: Response) {
        try {
            const user = req.user!;
            let criterium = await new Criterium({
                ...req.body,
                owner: user,
            }).save();
            res.json(criterium);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    async find(req: Request, res: Response) {
        try {
            res.json(await Criterium.findById(req.params.criteriumId).exec());
        } catch (error) {
            res.status(500).json(error);
        }
    }

    async list(req: Request, res: Response) {
        try {
            res.json(await Criterium.find({}));
        } catch (error) {
            res.status(500).json(error);
        }
    }

    async update(req: Request, res: Response) {
        try {
            res.json(
                await Criterium.findByIdAndUpdate(
                    req.params.criteriumId,
                    req.body
                )
            );
        } catch (error) {
            res.status(500).json(error);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            res.json(await Criterium.findByIdAndDelete(req.params.criteriumId));
        } catch (error) {
            res.status(500).json(error);
        }
    }
}

export const criteriumController = new CriteriumController();
