const sgmail = require('@sendgrid/mail');
const e = require('express');

sgmail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, token) => {
  sgmail.send({
    to: email,
    from: 'notify@thewalnulco.com',
    subject: 'A warm welcome to you!',
    text:
      'welcome to The walnut Co where PE meets clients. \n' +
      'please click on the below link to verify your email. \n' +
      `https://pe.thewalnutco.com/engineer/register/${token}`
  });
};

const sendForgotPassword = (email, token) => {
  sgmail.send({
    to: email,
    from: 'notify@thewalnulco.com',
    subject: 'Forgot Password Email',
    text: `https://pe.thewalnutco.com/engineer/forgetpassword/${token}`
  });
};

const sendEmailNotification = (email, subject, text) =>{

  let toMail = email != undefined ? email : 'notify@thewalnulco.com';
  sgMail.send({
      to: toMail,
      from: process.env.EMAIL,
      subject,
      text
  });
};

module.exports = { sendWelcomeEmail, sendForgotPassword, sendEmailNotification };