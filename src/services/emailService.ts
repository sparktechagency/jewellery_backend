import nodemailer from 'nodemailer';

const emailSender = async (subject: string, email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER ,
      pass: process.env.EMAIL_PASS ,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '"Jewellery" <efazkh@gmail.com>',
    to: email,
    subject: `${subject}`,
    html,
  });

  //  console.log("Message sent: %s", info.messageId);
};

export default emailSender;
