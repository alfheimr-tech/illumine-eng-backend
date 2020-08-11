const sgmail = require('@sendgrid/mail');

sgmail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, token) => {
  sgmail.send({
    to: email,
    from: 'zz10sushmit@gmail.com',
    subject: 'Welcome Email',
    text:
      'welcome to illumine industries where PE meets clients. \n' +
      'please click on the below link to verify your mail. \n' +
      `https://illumineiengineer.web.app/engineer/register/${token}`
  });
};

const sendForgotPassword = (email, token) => {
  sgmail.send({
    to: email,
    from: 'zz10sushmit@gmail.com',
    subject: 'Forgot Password Email',
    text: `http://localhost:4201/engineer/forgetpassword/${token}`
  });
};
module.exports = { sendWelcomeEmail, sendForgotPassword };
