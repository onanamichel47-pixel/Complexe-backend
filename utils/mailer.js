// backend/utils/mail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false, // STARTTLS pour 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envoie un email simple HTML + texte.
 * @param {Object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} opts.text
 * @param {string} [opts.html]
 */
export const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"Complexe NNOMO" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`,
  };

  return transporter.sendMail(mailOptions);
};
