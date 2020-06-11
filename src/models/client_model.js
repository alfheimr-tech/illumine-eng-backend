const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      background: false,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      minlength: 6
    },

    emailVerify: {
      type: Boolean,
      default: false
    },

    confirmToken: {
      type: String
    },

    confirmTokenExpiry: {
      type: Date
    },

    resetToken: {
      type: String
    },

    resetTokenExpiry: {
      type: Date
    },

    username: {
      type: String,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    tokens: [
      {
        type: String
      }
    ],

    avatar: {
      type: Buffer
    }
  },
  {
    timestamps: true
  }
);

const Client = mongoose.model('Client', clientSchema, 'clients');

module.exports = Client;
