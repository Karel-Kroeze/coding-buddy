import { Person } from "../models/person.model";
import { Request, Response } from "express";

// TODO: Check permissions!

export class PersonController {
    async create( req: Request, res: Response ){
        console.log( 'persons.create' );
        try {
            res.json( await new Person( req.body ).save() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async find( req: Request, res: Response ){
        console.log( 'persons.find' );
        try {
            res.json( await Person.findById( req.params.personId ).exec() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async list( req: Request, res: Response ){
        console.log( 'persons.list' );
        try {
            res.json( await Person.find({}) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async update( req: Request, res: Response ){
        console.log( 'persons.update' );
        try {
            res.json( await Person.findByIdAndUpdate( req.params.personId, req.body ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async delete( req: Request, res: Response ){
        console.log( 'persons.delete' );
        try {
            res.json( await Person.findByIdAndDelete( req.params.personId ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }
}

export const personController = new PersonController();