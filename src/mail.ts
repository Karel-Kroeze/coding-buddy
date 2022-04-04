import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport(
    {
        host: process.env.SMTP_HOST,
        secure: true,
        logger: true,
        debug: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    },
    {
        from: '"Coding Buddy" info@karel-kroeze.nl',
    }
);
