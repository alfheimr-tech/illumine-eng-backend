/* eslint-disable no-useless-return */
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendWelcomeEmail } = require('../email/account');

// const hash = crypto.createHash('sha256');
// const multer = require('multer');

const engineerSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate: function(value) {
      if (!validator.isEmail(value)) {
        throw new Error('please put a valid email!');
      }
    }
  },

  password: {
    type: String,
    minlength: 8,
    trim: true
  },

  avatar: {
    type: Buffer
  },

  username: {
    type: String,
    trim: true
  },

  phone: {
    type: Number,
    trim: true
  },

  profession: [
    {
      location: {
        type: String,
        trim: true
      },

      licence: {
        type: String,
        trim: true
      }
    }
  ],

  engineer_rating: {
    type: mongoose.Decimal128,
    default: 0.0
  },

  total_projects: {
    type: Number,
    default: 0
  },

  notifyByEmail: {
    type: Boolean,
    deafult: false
  },

  resetPasswordToken: {
    type: String
  },

  resetPasswordExpiry: {
    type: String
  },

  emailVerifyToken: {
    type: String
  },

  emailVerifyExpiry: {
    type: Date,
    trim: true
  },

  emailVerify: {
    type: Boolean,
    deafult: false
  },

  tokens: [
    {
      type: String
    }
  ]
});

// JSON ONJECT
engineerSchema.methods.toJSON = function() {
  const engineerObject = this.toObject();

  delete engineerObject.avatar;
  delete engineerObject.tokens;
  delete engineerObject.emailVerifyToken;
  delete engineerObject.emailVerifyExpiry;

  return engineerObject;
};
// CREATING A RANDOM TOKEN

engineerSchema.methods.createToken = function(email) {
  const token = crypto.randomBytes(24).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  if (email) {
    this.emailVerifyToken = hashedToken;
    this.emailVerifyExpiry = Date.now() + 1000 * 60 * 60; // 1 HOUR

    return token;
  }

  this.resetPasswordToken = hashedToken;
  this.resetPasswordExpiry = Date.now() + 1000 * 60 * 60; // 1 HOUR

  return token;
};

// CLEAR OUT EXPIRED TOKENS

engineerSchema.methods.clearExpiredTokens = async function() {
  // eslint-disable-next-line array-callback-return
  this.tokens = this.tokens.filter(token => {
    return jwt.verify(token, process.env.JWT_SECRET, err => {
      if (!err) return token;
    });
  });

  return;
};

// CREATING A AUTH TOKEN

engineerSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  this.tokens.push(token);

  return token;
};

// FINDING AN ENGINEER

engineerSchema.statics.findByCredentials = async function(email, password) {
  // eslint-disable-next-line no-use-before-define
  const engnr = await Engineer.findOne({ email });

  if (!engnr) {
    throw new Error('Could not find any such registered User! please signup');
  }

  if (password === undefined) {
    return engnr;
  }

  const isMatch = await bcrypt.compare(password, engnr.password);
  if (!isMatch) {
    throw new Error('wrong password!please enter the correct password');
  }

  return engnr;
};

// PRE HOOK

engineerSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  if (this.isModified('email')) {
    const token = this.createToken(true);
    this.emailVerify = false;

    // sendWelcomeEmail(this.email, token);
  }

  next();
});

const Engineer = mongoose.model('Engineer', engineerSchema, 'engineers');

module.exports = Engineer;
