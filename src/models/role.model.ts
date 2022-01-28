import mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';
import { IPerson } from './person.model';
import { IDataSet } from './dataset.model';
import { ERole } from './role.enum';
const ObjectId = mongoose.Schema.Types.ObjectId;

export interface IRole extends Document {
    person: IPerson
    dataset: IDataSet
    role: ERole
}

const RoleSchema: Schema = new Schema({
    person: { type: ObjectId, ref: 'Person', required: true },
    dataset: { type: ObjectId, ref: 'DataSet', required: true },
    role: { type: Number, required: true }
});

export const Role = mongoose.model<IRole>('Role', RoleSchema );
