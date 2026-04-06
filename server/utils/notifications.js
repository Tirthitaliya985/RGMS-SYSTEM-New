// utils/notifications.js
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Twilio from "twilio";
import { carrierGateways } from "./smsGateway.js";

dotenv.config();

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error("Email configuration is missing. Check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

const twilioClient = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
void twilioClient;

export const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const mailer = getTransporter();

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      attachments,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email error:", err);
    throw err;
  }
};

// SMS via email-to-SMS
export const sendSMS = async ({ phone, carrier, body }) => {
  try {
    const gateway = carrierGateways[carrier.toLowerCase()];
    if (!gateway) throw new Error("Carrier not supported for SMS");

    const to = `${phone}@${gateway}`;

    await sendEmail({
      to,
      subject: "", // SMS ignores subject
      text: body,
    });

    console.log(`SMS sent via email to ${phone}`);
  } catch (err) {
    console.error("SMS error:", err.message);
    throw err;
  }
};
