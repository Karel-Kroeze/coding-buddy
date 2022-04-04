import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Person, IPerson, PersonDocument } from "./models/person.model";
import { Router, Request } from "express";

passport.use(
    "local",
    new LocalStrategy(
        {
            usernameField: "email",
            passReqToCallback: true,
        },
        async function (req, username, password, done) {
            try {
                let user: PersonDocument | null = (await Person.findOne({
                    email: username,
                })) as any;
                if (!user) {
                    req.message("Incorrect username.");
                    return done(null, false);
                }
                if (!(await user.verifyPassword(password))) {
                    req.message("Incorrect password.");
                    return done(null, false);
                }
                req.message("success", `Welcome back, ${user.name}`);
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user: PersonDocument, done) => {
    return done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        let user = (await Person.findById(id)) as PersonDocument | null;
        if (!user) return done(null, false);
        return done(null, user);
    } catch (err) {
        return done(err);
    }
});

export const AuthRouter = Router();
AuthRouter.get("/login", (req, res) => res.render("login"));
AuthRouter.get("/logout", (req, res) => {
    let userName = req.user ? req.user.name : " beautiful stranger";
    req.logout();
    req.message("info", `Goodbye, ${userName}!`);
    res.redirect("/");
});
AuthRouter.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
    })
);
