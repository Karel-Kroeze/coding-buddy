import { Role } from "../models/role.model";
import { Request, Response } from "express";
import { IPerson } from "../models/person.model";

// TODO: Check permissions!

export class RoleController {
    async create( req: Request, res: Response ){
        console.log( 'roles.create' );
        try {
            res.json( await new Role( req.body ).save() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async find( req: Request, res: Response ){
        console.log( 'roles.find' );
        try {
            res.json( await Role.findById( req.params.roleId ).exec() );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async list( req: Request, res: Response ){
        console.log( 'roles.list' );
        try {
            res.json( await Role.find({}) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async update( req: Request, res: Response ){
        console.log( 'roles.update' );
        try {
            res.json( await Role.findByIdAndUpdate( req.body._id, req.body ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }

    async delete( req: Request, res: Response ){
        console.log( 'roles.delete' );
        try {
            res.json( await Role.findByIdAndDelete( req.params.roleId ) );
        } catch (error) {
            res.status( 500 ).json( error );
        }
    }
}

export const roleController = new RoleController();