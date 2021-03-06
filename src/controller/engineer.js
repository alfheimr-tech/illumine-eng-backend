/* eslint-disable dot-notation */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
const crypto = require('crypto');
// const sharp = require('sharp');
const { uuid } = require('uuidv4');
const { upload_docs } = require('../service');
const Engineer = require('../models/engineer_model');
const Bank = require('../models/bank_model');
const Engineer_Docs = require('../models/engnrDocs_model');
// const Notifications = require('../models/notifications_model');
const { sendForgotPassword, sendWelcomeEmail, sendEmailNotification } = require('../email/account');

// ENGINEER CREATES ACCOUNT

exports.create_engineer_account = async (req, res) => {
  try {
    const engnr_check = await Engineer.findOne({ email: req.body.email });

    if (engnr_check) {
      throw new Error(
        'This email id has already been registered! Please use an unregistered email id'
      );
    }

    const engnr = new Engineer(req.body);

    await engnr.save();

    const engnr_docs = new Engineer_Docs({
      engineerID: engnr.id
    });

    await engnr_docs.save();

    res.status(201).send({ message: 'created successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// RESEND  WELCOME EMAIL TO ENGINEER

exports.resend_engnr_mail = async (req, res) => {
  try {
    const engnr = await Engineer.findOne({ email: req.body.email });

    const token = await engnr.createToken(true);

    sendWelcomeEmail(req.body.email, token);

    await engnr.save();

    res.status(201).send({ message: 'mail sent' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// ENGINEER CREATES PROFILE

exports.create_engineer_profile = async (req, res) => {
  try {
    var documents = [];

    // ENGINEERS PERSONAL DETAIL
    req.engnr.username = req.body.username;
    req.engnr.password = req.body.password;

    // if (req.file) {
    //   const buffer = await sharp(req.file.buffer)
    //     .resize({ width: 250, height: 250 })
    //     .png()
    //     .toBuffer();
    //   req.engnr.avatar = buffer;
    // }

    if (req.file) {
      req.engnr.avatar = req.file.buffer;
    }

    req.engnr.phone = req.body.phone;
    for (let i = 0; i < req.body.location.length; i++) {
      req.engnr.profession.push({
        location: req.body.location[i],
        licence: req.body.licence[i]
      });
    }

    // HAVE TO STORE DOCUMENTS
    const s3 = upload_docs();
    const getUrl = async (fileDetail, key) => {
      return s3.getSignedUrl('putObject', {
        Bucket: 'sushu-bucket',
        Key: key,
        ContentType: fileDetail.fileType
      });
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const fileDetail of req.body.fileDetails) {
      const key = `${req.engnr.id}/${uuid()}.${fileDetail.extension}`;
      documents.push({
        // eslint-disable-next-line no-await-in-loop
        url: await getUrl(fileDetail, key),
        key,
        fileType: fileDetail.fileType,
        extension: fileDetail.extension
      });
    }

    // STORING BANK DETAILS OF PE
    const bank = new Bank({
      engineerID: req.engnr._id,
      bankName: req.body.bankName,
      accountNumber: req.body.accountNumber,
      ABA: req.body.ABA
    });

    await bank.save();

    await req.engnr.save();

    sendEmailNotification(undefined, `A warm welcome to you!`, `Hi ${req.engnr.username},\nWe are so thrilled to have on board an engineer of your caliber. ‘The Walnut Co’ is the ultimate professional freelancing website for Engineering Services. By registering with us, you have breathed a new life into your freelancing career. We hope you have an amazing experience with us.`);

    res.status(201).send({ message: 'profile has been created', documents });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.upload_engnr_docs = async (req, res) => {
  try {
    const engnr_docs = await Engineer_Docs.findOne({
      engineerID: req.engnr.id
    });

    engnr_docs.docs.push({
      Key: req.body.key,
      url: req.body.url,
      extension: req.body.extension,
      docType: 'engineer'
    });

    await engnr_docs.save();

    res.send();
  } catch (error) {
    res.status(400).send({ error: 'Fail' });
  }
};

// ENGINEER LOGIN

exports.engineer_login = async (req, res) => {
  try {
    const engnr = await Engineer.findByCredentials(
      req.body.email,
      req.body.password
    );

    await engnr.clearExpiredTokens();

    const token = await engnr.generateAuthToken();

    await engnr.save();

    // const notify = new Notifications({
    //   owner: engnr.id,
    //   notifications: [
    //     {
    //       content: 'WOAHOO! welcome to ILLUMINE INDUSTRIES'
    //     }
    //   ]
    // });

    // await notify.save();

    res.status(200).send({ message: 'logged in', token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// ENGINEER LOGOUT

exports.engineer_logout = async (req, res) => {
  try {
    req.engnr.tokens = [];

    await req.engnr.save();

    res.status(200).send({ message: 'logged out of all devices' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// ENGINEER EMAIL VERIFICATION

exports.engineer_emailverify = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.email_token)
      .digest('hex');

    const engnr = await Engineer.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpiry: { $gte: Date.now() }
    }).orFail(new Error('the link has expired'));

    engnr.emailVerify = true;

    const token = await engnr.generateAuthToken();

    await engnr.save();

    res.status(202).send({ message: 'email verified', token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// ENGINEER FORGOT PASSWORD

exports.engineer_forgotpassword = async (req, res) => {
  try {
    const engnr = await Engineer.findByCredentials(req.body.email);

    const token = await engnr.createToken(false);

    sendForgotPassword(engnr.email, token);

    await engnr.save();

    res.status(200).send({ message: 'mail sent' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// ENGINEER RESETS PASSWORD

exports.engineer_resetpassword = async (req, res) => {
  try {
    const updatesAllowed = ['password'];

    const updates = Object.keys(req.body);

    const isValid = updates.every(update => updatesAllowed.includes(update));

    if (!isValid) {
      throw new Error('error! cannot update');
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.pwd_token)
      .digest('hex');

    const engnr = await Engineer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gte: Date.now() }
    }).orFail(new Error('the link has expired'));

    engnr.password = req.body.password;

    await engnr.save();

    res.status(202).send({ message: 'your new password has been set' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// ENGINEER VIEWS PROFILE

exports.engineer_viewprofile = async (req, res) => {
  try {
    const bank = await Bank.findOne({ engineerID: req.engnr._id }).orFail(
      new Error('could not find any details')
    );

    res.status(200).send({
      profile: req.engnr,
      bank_details: bank,
      avatar: req.engnr.avatar
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// ENGINEER UPDATES PERSONAL DETAILS

exports.engineer_updatedetail = async (req, res) => {
  try {
    const updates = Object.keys(req.body);

    const bank = await Bank.findOne({ engineerID: req.engnr._id }).orFail(
      new Error('could not find details')
    );

    updates.forEach(update => {
      if (
        update === 'bankName' ||
        update === 'accountNumber' ||
        update === 'ABA'
      ) {
        bank[update] = req.body[update];
        return;
      }

      req.engnr[update] = req.body[update];
    });

    // if (req.files) {
    //   const buffer = await sharp(req.file.buffer)
    //     .resize({ width: 250, height: 250 })
    //     .png()
    //     .toBuffer();
    //   req.engnr.avatar = buffer;
    // }

    await bank.save();

    await req.engnr.save();

    res.status(202).send({ message: 'engineer profile updated' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
