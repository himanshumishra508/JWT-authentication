const nodemailer = require("nodemailer");

const sendMail = (receivermail, authToken) => {
  const userEmail = process.env.EMAIL.toString();
  const emailPassword = process.env.EMAIL_PASSWORD.toString();

  let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    secure:true,
    auth: {
      user: userEmail,
      pass: emailPassword,
    },
  });

  let mailOptions = {
    from: userEmail,
    to: receivermail,
    subject: "Email Confirmation For Account Activation",
    html: `<p1>Press <a href=http://localhost:3000/api/auth/verify/${authToken} > here </a> to verify your email.</p1> <br><br>
      <p1>The Link will expire in <strong>20 minutes!</strong></p1>`,
  };
  transport.sendMail(mailOptions, (err, res) => {
    if (err) {
      console.log(err);
      return err;
    }
  });
};

module.exports = sendMail;
