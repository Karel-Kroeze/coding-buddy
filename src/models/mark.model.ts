import mongoose, { Schema, Document } from 'mongoose';
import { IPerson } from './person.model';
import { IArtifact } from './artifact.model';
import { IDataSet } from './dataset.model';
import { ICode } from './code.model';

export interface IMark extends Document {
    coder: IPerson,
    code: ICode,
    artifact: IArtifact
    dataset: IDataSet
}

const MarkSchema: Schema = new Schema({
    coder: { type: Schema.Types.ObjectId, ref: 'Person' },
    artifact: { type: Schema.Types.ObjectId, ref: 'Artifact' },
    dataset: { type: Schema.Types.ObjectId, ref: 'DataSet' },
    code: { type: Schema.Types.ObjectId, ref: 'Code' }
});

export const Mark = mongoose.model<IMark>('Mark', MarkSchema );