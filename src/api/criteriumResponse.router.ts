import { Router } from 'express';
import { criteriumResponseController } from './criteriumResponse.controller';

export const criteriumResponseRouter = Router();

criteriumResponseRouter.post( "/", criteriumResponseController.create );
criteriumResponseRouter.get( "/:criteriumresponseId", criteriumResponseController.find );
criteriumResponseRouter.get( "/", criteriumResponseController.list );
criteriumResponseRouter.patch( "/", criteriumResponseController.update );
criteriumResponseRouter.delete( "/:criteriumresponseId", criteriumResponseController.delete );