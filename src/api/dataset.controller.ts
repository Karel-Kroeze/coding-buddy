import { DataSet } from "../models/dataset.model";
import { Request, Response } from "express";

// TODO: Check permissions!

export class DataSetController {
    async create( req: Request, res: Response ){
        console.log( 'datasets.create' );
        try {
            res.json( await new DataSet( req.body ).save() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async find( req: Request, res: Response ){
        console.log( 'datasets.find' );
        try {
            res.json( await DataSet.findById( req.params.datasetId ).exec() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async list( req: Request, res: Response ){
        console.log( 'datasets.list' );
        try {
            res.json( await DataSet.find({}) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async update( req: Request, res: Response ){
        console.log( 'datasets.update' );
        try {
            res.json( await DataSet.findByIdAndUpdate( req.body._id, req.body ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async delete( req: Request, res: Response ){
        console.log( 'datasets.delete' );
        try {
            res.json( await DataSet.findByIdAndDelete( req.params.datasetId ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }
}

export const datasetController = new DataSetController();