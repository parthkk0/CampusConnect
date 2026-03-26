require('dotenv').config();
const nodemailer = require('nodemailer');

async function testMail() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    console.log(`Testing authentication for: ${process.env.EMAIL_USER}`);
    console.log(`With password starting with: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 3) + '...' : 'undefined'}`);

    try {
        await transporter.verify();
        console.log("SUCCESS: Gmail accepted the credentials!");
    } catch (error) {
        console.error("\nFAILED: Google blocked the login attempt.");
        console.error("Exact Error from Google:\n", error.message);
    }
}
testMail();
