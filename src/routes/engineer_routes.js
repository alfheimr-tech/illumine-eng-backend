const express = require('express');
const engnrController = require('../controller/engineer');
const auth = require('../middleware/auth');
const { upload_pic } = require('../service');

const Router = new express.Router();

// ENGINEER SIGNUP ROUTE
Router.route('/signup').post(engnrController.create_engineer_account);

// ENGINEER PROFILE ROUTE
Router.route('/profile')
  .post(
    auth,
    upload_pic.single('avatar'),
    engnrController.create_engineer_profile,
    (error, req, res, next) => {
      res.status(400).send({ error: error.message });
    }
  )
  .put(auth, engnrController.upload_engnr_docs);

// ENGINEER EMAIL VERIFY ROUTE
Router.route('/confirm_mail/:email_token').put(
  engnrController.engineer_emailverify
);

// ENGINE LOGIN ROUTE
Router.route('/login').post(engnrController.engineer_login);

// ENGINEER LOGOUT ROUTE
Router.route('/logout').post(auth, engnrController.engineer_logout);

// ENGINEER FORGOT PASSWORD
Router.route('/forgot/password').post(engnrController.engineer_forgotpassword);

// ENGINEER RESET PASSWORD
Router.route('/reset/:pwd_token').patch(engnrController.engineer_resetpassword);

// ENGINEER VIEWS HIS PROFILE
Router.route('/profile/view').get(auth, engnrController.engineer_viewprofile);

// ENGINEER UPDATE DETAILS ROUTE
Router.route('/profile/update').patch(
  auth,
  engnrController.engineer_updatedetail
);

module.exports = Router;
