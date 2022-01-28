import { Request, Response } from "express";
import { CriteriumResponse } from "../models/criteriumResponse.model";

// TODO: Check permissions!

export class CriteriumResponseController {
    async create( req: Request, res: Response ){
        console.log( 'criteriumresponses.create' );
        try {
            res.json( await new CriteriumResponse( req.body ).save() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async find( req: Request, res: Response ){
        console.log( 'criteriumresponses.find' );
        try {
            res.json( await CriteriumResponse.findById( req.params.criteriumresponseId ).exec() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async list( req: Request, res: Response ){
        console.log( 'criteriumresponses.list' );
        try {
            res.json( await CriteriumResponse.find({}) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async update( req: Request, res: Response ){
        console.log( 'criteriumresponses.update' );
        try {
            res.json( await CriteriumResponse.findByIdAndUpdate( req.body._id, req.body ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async delete( req: Request, res: Response ){
        console.log( 'criteriumresponses.delete' );
        try {
            res.json( await CriteriumResponse.findByIdAndDelete( req.params.criteriumresponseId ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }
}

export const criteriumResponseController = new CriteriumResponseController();