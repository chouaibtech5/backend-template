const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
// new Email(user , url).sendWelcome();

module.exports = class Email {
    
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Your Name <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // SendGrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        return nodemailer.createTransport({
            service: 'Gmail',
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    send(template, subject ) {
        // 1) render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug` , {
            firstName : this.firstName ,
            url : this.url ,
            subject
        });
        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html ,
            text: htmlToText.convert(html)
        };
        // 3) Create a transport and send email
        this.newTransport().sendMail(mailOptions);
    }


    async sendWelcome() {
        await this.send(
            'Welcome to the Family!',
            `Hello ${this.firstName}, welcome to our community! Please visit ${this.url} to get started.`
        );
    }

    async sendPasswordReset() {
        await this.send(
            'Password Reset',
            `Hello ${this.firstName}, to reset your password, please click the following link: ${this.url}. If you did not request a password reset, please ignore this email.`
        );
    }
};




