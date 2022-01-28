import { Router } from 'express';
import { datasetController } from './dataset.controller';

export const DataSetRouter = Router();

DataSetRouter.post( "/", datasetController.create );
DataSetRouter.get( "/:datasetId", datasetController.find );
DataSetRouter.get( "/", datasetController.list );
DataSetRouter.patch( "/", datasetController.update );
DataSetRouter.delete( "/:datasetId", datasetController.delete );