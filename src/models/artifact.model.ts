import mongoose from "mongoose";
import { Schema, Document } from "mongoose";
import { ICode } from "./code.model";
import { IDataSet } from "./dataset.model";
import { IMark } from "./mark.model";
const ObjectId = mongoose.Schema.Types.ObjectId;

export interface IArtifact extends Document {
    content: any;
    codes: ICode[];
    dataset: IDataSet;
    marks: IMark[];
}

const ArtifactSchema: Schema = new Schema({
    content: { type: Object, required: true },
    dataset: { type: ObjectId, ref: "DataSet" },
    codes: [{ type: ObjectId, ref: "Code", default: [] }],
    marks: [{ type: ObjectId, ref: "Mark", default: [] }],
});

ArtifactSchema.post("remove", async (artifact: IArtifact) => {
    // remove codes on this document
    await artifact.populate("codes");
    await Promise.all(artifact.codes.map((c) => c.remove()));
    await Promise.all(artifact.marks.map((m) => m.remove()));
});

export const Artifact = mongoose.model<IArtifact>("Artifact", ArtifactSchema);
