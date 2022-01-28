import { Router } from 'express';
import { codeController } from './code.controller';

export const CodeRouter = Router();

CodeRouter.post( "/", codeController.create );
CodeRouter.get( "/:codeId", codeController.find );
CodeRouter.get( "/", codeController.list );
CodeRouter.patch( "/", codeController.update );
CodeRouter.delete( "/:codeId", codeController.delete );