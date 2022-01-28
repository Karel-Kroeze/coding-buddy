import { MessageTypes, IMessage } from "../messages";

declare global {
    namespace Express {
        interface Request {
            message(type: MessageTypes, message: string): void;
            message(message: string): void;
            message(message: IMessage): void;

            messages(type?: MessageTypes): IMessage[];
        }
    }
}

declare module "express-session" {
    interface Session {
        messages: IMessage[];
    }
}
