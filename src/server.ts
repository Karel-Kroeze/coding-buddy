import "dotenv/config";

import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";
import methodOverride from "method-override";
import morgan from "morgan";
import passport = require("passport");
import path from "path";

import { ApiRouter } from "./api/router";
import { AuthRouter } from "./authentication";
import { UnauthorizedHandler } from "./authorization";
import { HTMLRouter } from "./backend/router";
import { connect } from "./db";
import { messages } from "./messages";

const PORT = 3000;

export const app = express();

app.listen(PORT);
app.on("listening", () => console.log("Coding Buddy is listening."));

connect();
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(methodOverride("_method", { methods: ["GET", "POST"] }));
app.use(morgan("dev"));
app.use(session({ secret: process.env.COOKIE_SECRET || "super-secret" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(async (req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use(messages);
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(AuthRouter);
app.use("/api", ApiRouter);
app.use(HTMLRouter);
app.use(UnauthorizedHandler);
