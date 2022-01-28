import mongoose, { HydratedDocument } from "mongoose";
import { Schema } from "mongoose";
import { IPerson } from "./person.model";
import { CriteriumResponse } from "./criteriumResponse.model";
const ObjectId = mongoose.Schema.Types.ObjectId;

export interface ICriterium {
    name: string;
    label: string;
    desc: string;
    type: "enum" | "number" | "boolean" | "open";
    hotkey?: string;
    min?: number;
    max?: number;
    options?: {
        label: string;
        desc?: string;
    }[];
    owner: IPerson;
}

const CriteriumSchema = new Schema<ICriterium>({
    name: { type: String, required: true },
    label: { type: String, unique: true, index: true },
    desc: String,
    type: String,
    min: Number,
    max: Number,
    hotkey: String,
    options: [
        {
            label: String,
            desc: String,
        },
    ],
    owner: { type: ObjectId, ref: "Person", required: true },
});

export type CriteriumDocument = HydratedDocument<ICriterium>;

CriteriumSchema.post("remove", async (criterium: CriteriumDocument) => {
    // remove all responses based on this schema
    await CriteriumResponse.deleteMany({ criterium: criterium.id });
});

CriteriumSchema.pre("save", async function (this: ICriterium, next) {
    // remove empty options
    if (this.options) this.options = this.options.filter((o) => !!o.label);
    next();
});

export const Criterium = mongoose.model<ICriterium>(
    "Criterium",
    CriteriumSchema
);
