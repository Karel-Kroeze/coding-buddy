import mongoose, { HydratedDocument } from "mongoose";
import { Schema, Model } from "mongoose";
import { randomBytes } from "crypto";
const SALT_LENGTH = 64;

import { pbkdf2 } from "mz/crypto";
import { Role } from "./role.model";
import { IDataSet, DataSet } from "./dataset.model";
import { Code } from "./code.model";
import { Criterium } from "./criterium.model";
import { ERole } from "./role.enum";
import { Mark } from "./mark.model";

export interface IPerson {
    name: string;
    email: string;
    password: string;
    salt: string;
    admin: boolean;
}

export interface IPersonMethods {
    verifyPassword(password: string): Promise<boolean>;
    setPassword(password: string): Promise<void>;
    can(
        action: ERole | keyof typeof ERole,
        dataset: mongoose.Types.ObjectId | IDataSet
    ): Promise<boolean>;
    role(dataset: mongoose.Types.ObjectId | IDataSet): Promise<ERole>;
    roleString(dataset: mongoose.Types.ObjectId | IDataSet): Promise<string>;
    createLoginToken(): void;
}

export interface IPersonModel extends Model<IPerson> {
    hash(password: string, salt: string): Promise<string>;
}

export type PersonDocument = HydratedDocument<IPerson, IPersonMethods>;

const PersonSchema = new Schema<IPerson, IPersonModel, IPersonMethods>({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    admin: { type: Boolean, default: false },
});

PersonSchema.static(
    "hash",
    async function (secret: string, salt: string): Promise<string> {
        return pbkdf2(secret, salt, 2500, 64, "sha512").then((h) =>
            h.toString("base64")
        );
    }
);

PersonSchema.method({
    verifyPassword: async function (
        this: HydratedDocument<IPerson, IPersonMethods>,
        secret: string
    ) {
        let hash = await Person.hash(secret, this.salt);
        return hash === this.password;
    },
    setPassword: async function (this: PersonDocument, secret: string) {
        let salt = randomBytes(Math.ceil(SALT_LENGTH))
            .toString("hex") /** convert to hexadecimal format */
            .slice(0, SALT_LENGTH);
        this.salt = salt;
        this.password = await Person.hash(secret, salt);
    },
    createLoginToken: async function (this: PersonDocument) {
        await this.setPassword(randomBytes(50).toString("hex").slice(0, 12));
    },
    can: async function (
        this: PersonDocument,
        action: ERole,
        dataset: mongoose.Types.ObjectId | IDataSet
    ): Promise<boolean> {
        if (typeof action == "string") action = <any>ERole[action];
        let role = await this.role(dataset);
        return role >= action;
    },
    role: async function (
        this: PersonDocument,
        dataset: mongoose.Types.ObjectId | IDataSet
    ): Promise<ERole> {
        if (this.admin) return ERole.admin;

        let _dataset =
            dataset instanceof DataSet
                ? dataset
                : await DataSet.findById(dataset);
        if (!_dataset) return ERole.none;

        if (_dataset.owner == this.id) return ERole.admin;

        let _role = await Role.findOne({
            person: this.id,
            dataset: _dataset.id,
        });
        return _role
            ? typeof _role.role == "number"
                ? _role.role
                : <any>ERole[_role.role]
            : ERole.none;
    },

    roleString: async function (
        this: PersonDocument,
        dataset: mongoose.Types.ObjectId | IDataSet
    ): Promise<string> {
        let role = await this.role(dataset);
        return ERole[role];
    },
});

PersonSchema.post("remove", async (person: PersonDocument) => {
    // remove documents owned or created by this person.
    await Promise.all([
        DataSet.deleteMany({ owner: person.id }),
        Code.deleteMany({ coder: person.id }),
        Criterium.deleteMany({ owner: person.id }),
        Role.deleteMany({ person: person.id }),
        Mark.deleteMany({ coder: person.id }),
    ]);
});

export const Person = mongoose.model<IPerson, IPersonModel, IPersonMethods>(
    "Person",
    PersonSchema
);
