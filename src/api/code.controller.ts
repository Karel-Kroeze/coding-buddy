import { Request, Response } from "express";
import { Code } from "../models/code.model";

// TODO: Check permissions!

export class CodeController {
    async create( req: Request, res: Response ){
        console.log( 'codes.create' );
        try {
            res.json( await new Code( req.body ).save() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async find( req: Request, res: Response ){
        console.log( 'codes.find' );
        try {
            res.json( await Code.findById( req.params.codeId ).exec() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async list( req: Request, res: Response ){
        console.log( 'codes.list' );
        try {
            res.json( await Code.find({}) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async update( req: Request, res: Response ){
        console.log( 'codes.update' );
        try {
            res.json( await Code.findByIdAndUpdate( req.body._id, req.body ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async delete( req: Request, res: Response ){
        console.log( 'codes.delete' );
        try {
            res.json( await Code.findByIdAndDelete( req.params.codeId ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }
}

export const codeController = new CodeController();