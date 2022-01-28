import mongoose from "mongoose";

let connection_string = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;
let options = {};

export async function connect() {
    let db = mongoose.connect(connection_string, options);
    db.catch(console.error).then(() => console.log("DB connected"));
    return db;
}
