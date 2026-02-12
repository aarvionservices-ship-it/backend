
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

// Check if Resend API key is configured
const useResend = !!process.env.RESEND_API_KEY;

// Initialize Resend if API key is available
let resend;
if (useResend) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('Email service: Using Resend');
} else {
    console.log('Email service: Using Nodemailer');
}

// Initialize Nodemailer transporter (fallback)
const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE, // Optional: 'gmail', 'hotmail', etc.
    host: process.env.SMTP_HOST,     // Optional: 'smtp.example.com'
    port: process.env.SMTP_PORT,     // Optional: 587, 465, 25
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        if (useResend) {
            // Use Resend to send email
            const data = await resend.emails.send({
                from: process.env.EMAIL_USER || 'onboarding@resend.dev',
                to: Array.isArray(to) ? to : [to],
                subject,
                text,
                html
            });
            console.log('Email sent via Resend:', data.id);
            return data;
        } else {
            // Use Nodemailer to send email
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
                html
            });
            console.log('Email sent via Nodemailer:', info.messageId);
            return info;
        }
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
