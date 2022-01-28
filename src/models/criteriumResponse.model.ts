import mongoose from "mongoose";
import { Schema, Document } from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

import { ICriterium } from "./criterium.model";

export interface ICriteriumResponse extends Document {
    criterium: ICriterium;
    value: any;
}

const CriteriumResponseSchema: Schema = new Schema({
    criterium: { type: ObjectId, ref: "Criterium", required: true },
    value: Object,
});

export const CriteriumResponse = mongoose.model<ICriteriumResponse>(
    "CriteriumResponse",
    CriteriumResponseSchema
);
