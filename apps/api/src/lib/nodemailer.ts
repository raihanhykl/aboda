import nodemailer from 'nodemailer';
import { NODEMAILER_EMAIL, NODEMAILER_PASSWORD } from '@/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { compile } from 'handlebars';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: NODEMAILER_EMAIL,
    pass: NODEMAILER_PASSWORD,
  },
});

export const sendVerificationEmail = (
  to: string,
  data: {
    email: string;
    verification_url: string;
  },
) => {
  const templatePath = join(__dirname, '../templates/', 'verification.hbs'); //cari file hbs
  const templateSource = readFileSync(templatePath, 'utf-8'); // salin isi file
  const compiledTemplate = compile(templateSource); //diubah jadi handlebars supaya bisa diinput value ke dalam html(function)
  const html = compiledTemplate(data); // masukan email dan verification value ke dalam html// return string
  const mailOptions: nodemailer.SendMailOptions = {
    to,
    subject: 'please verifty your account',
    html,
  };

  return transporter.sendMail(mailOptions);
};
