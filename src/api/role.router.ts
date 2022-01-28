import { Router } from 'express';
import { roleController } from './role.controller';

export const RoleRouter = Router();

RoleRouter.post( "/", roleController.create );
RoleRouter.get( "/:roleId", roleController.find );
RoleRouter.get( "/", roleController.list );
RoleRouter.patch( "/", roleController.update );
RoleRouter.delete( "/:roleId", roleController.delete );