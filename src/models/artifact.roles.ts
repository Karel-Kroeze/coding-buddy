import { User } from '../authorization';
import { Request } from 'express';
import { Artifact, IArtifact } from './artifact.model';

User.entity( "artifact", async ( req: Request, done: any ) => {
    try {
        let match = req.originalUrl.match( /\/artifacts\/(\w+)\/?/ );
        if (!match){
            return done( new Error( `Expected url like '/artifact/:id'.`));
        }
        let artifact = await Artifact.findById( match[1] );
        if (!artifact){
            return done( new Error( `artifact not found.`));
        }
        return done( null, artifact );
    } catch (err) {
        return done( err );
    }
});

User.role( "artifact.owner", async ( artifact: IArtifact, req: Request, done: any ) => {
    if (!req.user || !artifact ){
        return done();
    } else {
        try{
            await artifact.populate('dataset');
            return done( null, artifact.dataset.owner === req.user.id );
        } catch (err){
            return done( err );
        }
    }
});

User.action( "create artifact", ['admin', 'authenticated']);
User.action( "view artifact", ['admin', 'authenticated']);
User.action( "list artifacts", ['admin', 'dataset.owner']);
User.action( "edit artifact", ['admin', 'artifact.owner']);
User.action( "delete artifact", ['admin', 'artifact.owner']);