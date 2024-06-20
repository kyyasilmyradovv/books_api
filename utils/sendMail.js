const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_ADDRESS,
    pass: process.env.MAIL_PASSWORD,
  },
});

exports.sendMail = async (user) => {
  // Generate code
  let verificationCode =
    Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;

  // Send the code to user.email
  const mailOptions = {
    from: `Books project <${process.env.MAIL_ADDRESS}>`,
    to: user.email,
    subject: 'Email verification',
    html: `<p style="font-size: 15px;">Your code is(duration is 5 minutes): <strong style="font-size: 20px;">${verificationCode}</strong></p>`,
  };

  transporter.sendMail(mailOptions, function (err) {
    if (err) {
      console.log(err);
    }
  });

  // Write code to db
  await user.update({ verificationCode });
};
