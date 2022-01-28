import { Request, Response, NextFunction, RequestHandler } from "express";

export interface IMessage {
    type: MessageTypes;
    title?: string;
    message: string;
}

export type MessageTypes = "success" | "warning" | "danger" | "info";

export function messages(req: Request, res: Response, next: NextFunction) {
    // copy session messages to local
    res.locals.messages = req.session!.messages || [];

    // reset message memory
    req.session!.messages = [];

    // implement message function on request
    req.message = function (a: string | MessageTypes | IMessage, b?: string) {
        let message;
        if (b) {
            message = { type: <any>a, message: b };
        } else if (typeof a === "string") {
            message = { type: "danger", message: a };
        } else {
            message = a;
        }
        console.log(message.message);
        req.session!.messages.push(message);
    };

    // implement message getter for current response flashing
    req.messages = function (type?: MessageTypes): IMessage[] {
        // if no type is specified, this is easy - just return all.
        if (typeof type === "undefined") {
            // create copy of array
            let ret = req.session!.messages.slice(0);

            // remove original
            req.session!.messages = [];

            // return copy
            return ret;
        }

        // a type is specified, return only those that match.
        let ret = req.session!.messages.filter((m) => m.type == type);
        req.session!.messages = req.session!.messages.filter(
            (m) => m.type != type
        );
        return ret;
    };

    // and we're done
    next();
}
