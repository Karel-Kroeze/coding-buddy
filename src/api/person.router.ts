import { Router } from 'express';
import { personController } from './person.controller';
import { User } from '../authorization';

export const PersonRouter = Router();

PersonRouter.post( "/", User.can("create person"), personController.create );
PersonRouter.get( "/:personId", User.can("view person"), personController.find );
PersonRouter.get( "/", User.can("list persons"), personController.list );
PersonRouter.patch( "/:personId", User.can("edit person"), personController.update );
PersonRouter.delete( "/:personId", User.can("delete person"), personController.delete );