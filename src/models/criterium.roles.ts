import { User } from '../authorization';
import { Request } from 'express';
import { Criterium, ICriterium } from './criterium.model';

User.entity( "criterium", async ( req: Request, done: any ) => {
    try {
        let match = req.originalUrl.match( /\/criteria\/(\w+)\/?/ );
        if (!match){
            return done( new Error( `Expected url like '/criterium/:id'.`));
        }
        let criterium = await Criterium.findById( match[1] );
        if (!criterium){
            return done( new Error( `Criterium not found.`));
        }
        return done( null, criterium );
    } catch (err) {
        return done( err );
    }
});

User.role( "criterium.owner", ( criterium: ICriterium, req: Request, done: any ) => {
    if (!req.user || !criterium ){
        return done();
    } else {
        return done( null, criterium.owner === req.user.id );
    }
});

User.action( "list criteria", ['admin', 'authenticated']);
User.action( "create criterium", ['admin', 'authenticated']);
User.action( "view criterium", ['admin', 'authenticated']);
User.action( "edit criterium", ['admin', 'criterium.owner']);
User.action( "delete criterium", ['admin', 'criterium.owner']);