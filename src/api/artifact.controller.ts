import { Artifact } from "../models/artifact.model";
import { Request, Response } from "express";

// TODO: Check permissions!

export class ArtifactController {
    async create( req: Request, res: Response ){
        console.log( 'artifacts.create' );
        try {
            res.json( await new Artifact( req.body ).save() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async find( req: Request, res: Response ){
        console.log( 'artifacts.find' );
        try {
            res.json( await Artifact.findById( req.params.artifactId ).exec() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async list( res: Response ){
        console.log( 'artifacts.list' );
        try {
            res.json( await Artifact.find({}) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async update( req: Request, res: Response ){
        console.log( 'artifacts.update' );
        try {
            res.json( await Artifact.findByIdAndUpdate( req.params.artifactId, req.body ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async delete( req: Request, res: Response ){
        console.log( 'artifacts.delete' );
        try {
            res.json( await Artifact.findByIdAndDelete( req.params.artifactId ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }
}

export const artifactController = new ArtifactController();