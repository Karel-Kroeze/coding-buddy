import mongoose, { HydratedDocument, Schema, Types, Mongoose } from "mongoose";

import { Artifact, IArtifact } from "./artifact.model";
import { Code, ICode } from "./code.model";
import { CriteriumDocument, ICriterium } from "./criterium.model";
import { IMark, Mark } from "./mark.model";
import { IPerson, PersonDocument } from "./person.model";
import { ERole } from "./role.enum";
import { IRole, Role } from "./role.model";

export interface IDataSet {
    artifacts: IArtifact[];
    owner: IPerson;
    name: string;
    desc: string;
    type: "conceptmap" | "text" | "feedback" | "proposition" | "observations";
    template?: string;
    coding: boolean;
    completed: boolean;
    criteria: ICriterium[];
    roles: IRole[];
    progress: IProgress;
    marks: IMark[];
    codes: ICode[];
}

export interface IDataSetMethods {
    getRole: (person: IPerson) => Promise<ERole>;
    getProgress: () => Promise<IProgress>;
    getMarks: () => Promise<IMark[]>;
    getCodes: () => Promise<ICode[]>;

    criteria: CriteriumDocument[];
}

export interface IProgress {
    total: number;
    completed: number;
    overlap: number;
}

const DataSetSchema = new Schema<IDataSet, IDataSetMethods>({
    artifacts: [{ type: Schema.Types.ObjectId, ref: "Artifact" }],
    owner: { type: Schema.Types.ObjectId, ref: "Person", required: true },
    name: { type: String, required: true },
    desc: String,
    type: { type: String, required: true },
    template: { type: String, required: false },
    criteria: [{ type: Schema.Types.ObjectId, ref: "Criterium" }],
    roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    coding: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
});

export type DataSetDocument = HydratedDocument<IDataSet, IDataSetMethods>;

// TODO: Find a better solution for sync accessors to async data?
DataSetSchema.method({
    getProgress: async function (this: DataSetDocument): Promise<IProgress> {
        let progress = await Artifact.aggregate([
            { $match: { dataset: new mongoose.Types.ObjectId(this.id) } },
            { $group: { _id: { $size: "$codes" }, count: { $sum: 1 } } },
            { $project: { numCodes: "$_id", _id: false, count: "$count" } },
        ]);

        let sum = (x: any[]) => x.reduce((a, b) => a + b.count, 0);
        let total = sum(progress);
        let completed = sum(progress.filter((p) => p.numCodes > 0));
        let overlap = sum(progress.filter((p) => p.numCodes > 1));

        (<any>this)._progress = { total, completed, overlap };
        return (<any>this)._progress;
    },
    getMarks: async function (this: DataSetDocument): Promise<IMark[]> {
        (<any>this)._marks = await Mark.find({ dataset: this.id });
        return (<any>this)._marks;
    },
    getCodes: async function (this: DataSetDocument): Promise<IMark[]> {
        // proceed with idiotic way to get codes for a dataset.
        // get list of artifact id's in the dataset
        const artifacts = await Artifact.find({ dataset: this.id }, "_id");

        // get list of codes referencing these artifacts
        (<any>this)._codes = await Code.find({ artifact: { $in: artifacts } });

        // (<any>this)._codes = await Code.find({ 'artifact.dataset.id': this.id });
        return (<any>this)._codes;
    },
});

DataSetSchema.virtual("progress").get(function (
    this: DataSetDocument
): IProgress {
    if (typeof (<any>this)._progress === "undefined")
        throw "progress not set. Make sure to call getProgress before accessing progress.";
    return (<any>this)._progress;
});
DataSetSchema.virtual("marks").get(function (this: DataSetDocument): IMark[] {
    if (typeof (<any>this)._marks === "undefined")
        throw "marks not set. Make sure to call getMarks before accessing marks.";
    return (<any>this)._marks;
});
DataSetSchema.virtual("codes").get(function (this: DataSetDocument): ICode[] {
    if (typeof (<any>this)._codes === "undefined")
        throw "codes not set. Make sure to call getCodes before accessing codes.";
    return (<any>this)._codes;
});

DataSetSchema.post("remove", async (dataSet: DataSetDocument) => {
    await Promise.all([
        Artifact.deleteMany({ dataset: dataSet.id }),
        Role.deleteMany({ dataset: dataSet.id }),
    ]);
});

export const DataSet = mongoose.model<IDataSet>("DataSet", DataSetSchema);
