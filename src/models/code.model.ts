import mongoose from "mongoose";
import { Schema, Document } from "mongoose";
import { IPerson } from "./person.model";
import { IArtifact, Artifact } from "./artifact.model";
import { ICriteriumResponse } from "./criteriumResponse.model";
const ObjectId = mongoose.Schema.Types.ObjectId;

export interface ICode extends Document {
    coder: IPerson;
    artifact: IArtifact;
    criteria: ICriteriumResponse[];
}

const CodeSchema: Schema = new Schema({
    coder: { type: ObjectId, ref: "Person" },
    artifact: { type: ObjectId, ref: "Artifact" },
    criteria: [{ type: ObjectId, ref: "CriteriumResponse" }],
});

CodeSchema.post("remove", async (code: ICode) => {
    let artifact = await Artifact.findById(code.artifact);
    if (artifact) {
        (<any>artifact.codes).pull(code.id);
        await artifact.save();
    }
    await code.populate("criteria");
    await Promise.all(code.criteria.map((c) => c.remove()));
});

export const Code = mongoose.model<ICode>("Code", CodeSchema);
