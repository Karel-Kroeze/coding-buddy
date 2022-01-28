import { Router } from 'express';
import { DataSetRouter } from './dataset.router';
import { PersonRouter } from './persons.router';
import { CriteriaRouter } from './criteria.router';
import { CodingRouter } from './coding.router';

export const HTMLRouter = Router();

HTMLRouter.get( "/", (req, res ) => res.render( "index" ) );
HTMLRouter.use( ( req, res, next ) => {
    let path = req.url.match( /\/(\w+)\/?/ );
    if ( path )
        res.locals.path = path[1];
    next();
});
HTMLRouter.use( "/datasets", DataSetRouter );
HTMLRouter.use( "/persons", PersonRouter );
HTMLRouter.use( "/criteria", CriteriaRouter );
HTMLRouter.use( "/coding", CodingRouter );