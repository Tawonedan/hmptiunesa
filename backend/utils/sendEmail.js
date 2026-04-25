const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const sendEmail = async (options) => {
  const TOKEN = process.env.MAILTRAP_TOKEN;
  const INBOX_ID = process.env.MAILTRAP_INBOX_ID;
  const SENDER_EMAIL = process.env.MAILTRAP_SENDER_EMAIL || "hello@demomailtrap.com";

  if (!TOKEN || !INBOX_ID) {
    console.error("MAILTRAP_TOKEN or MAILTRAP_INBOX_ID is not defined in .env");
    throw new Error("Konfigurasi Mailtrap belum lengkap (Token atau Inbox ID hilang)");
  }

  const transport = Nodemailer.createTransport(
    MailtrapTransport({
      token: TOKEN,
      sandbox: true,
      testInboxId: parseInt(INBOX_ID, 10)
    })
  );

  const sender = {
    address: SENDER_EMAIL,
    name: "HMPTI UNESA",
  };

  try {
    await transport.sendMail({
      from: sender,
      to: [options.email],
      subject: options.subject,
      text: options.message,
      html: options.html || options.message,
      category: "Verification"
    });
    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
