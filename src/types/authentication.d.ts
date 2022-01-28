import { PersonDocument } from "../models/person.model";

declare global {
    namespace Express {
        export interface User extends PersonDocument {}
    }
}
