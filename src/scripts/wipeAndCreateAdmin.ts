import { connect } from "../db";
import { Artifact } from "../models/artifact.model";
import { Code } from "../models/code.model";
import { Criterium } from "../models/criterium.model";
import { CriteriumResponse } from "../models/criteriumResponse.model";
import { DataSet } from "../models/dataset.model";
import { Person, PersonDocument } from "../models/person.model";
import { Role } from "../models/role.model";

async function wipeAndCreateAdmin() {
    let db = await connect();
    try {
        // wipe
        await Artifact.deleteMany({});
        await Code.deleteMany({});
        await Criterium.deleteMany({});
        await CriteriumResponse.deleteMany({});
        await DataSet.deleteMany({});
        await Person.deleteMany({});
        await Role.deleteMany({});
        console.log("DB wiped");

        // create admin
        let admin = new Person({
            name: "admin",
            email: "admin@example.com",
            admin: true,
        }) as PersonDocument;
        await admin.setPassword("secret");
        await admin.save();
    } catch (err) {
        console.error(err);
    } finally {
        db.connection.close();
    }
}

wipeAndCreateAdmin();
