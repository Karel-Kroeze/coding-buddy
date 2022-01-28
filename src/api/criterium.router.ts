import { Router } from 'express';
import { criteriumController } from './criterium.controller';
import { User } from '../authorization';

export const CriteriumRouter = Router();

CriteriumRouter.post( "/", User.can( 'create criterium' ), criteriumController.create );
CriteriumRouter.get( "/:criteriumId", User.can( 'view criterium' ), criteriumController.find );
CriteriumRouter.get( "/", User.can( 'view criterium' ), criteriumController.list );
CriteriumRouter.patch( "/:criteriumId", User.can( 'edit criterium' ), criteriumController.update );
CriteriumRouter.delete( "/:criteriumId", User.can( 'delete criterium' ), criteriumController.delete );