import { Router } from 'express';
import { artifactController } from './artifact.controller';
import { User } from '../authorization';

export const ArtifactRouter = Router();

ArtifactRouter.post( "/", User.can( "create artifact" ), artifactController.create );
ArtifactRouter.get( "/:artifactId", User.can( "view artifact" ), artifactController.find );
ArtifactRouter.get( "/", User.can( "view artifact" ), artifactController.list );
ArtifactRouter.patch( "/:artifactId", User.can( "update artifact" ), artifactController.update );
ArtifactRouter.delete( "/:artifactId", User.can( "delete artifact" ), artifactController.delete );