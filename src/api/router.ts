import { Router } from 'express';
import { DataSetRouter } from './dataset.router';
import { PersonRouter } from './person.router';
import { CriteriumRouter } from './criterium.router';

export const ApiRouter = Router();

ApiRouter.use( "/datasets", DataSetRouter );
ApiRouter.use( "/persons", PersonRouter );
ApiRouter.use( "/criteria", CriteriumRouter );