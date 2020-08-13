const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  engineerID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true
  },

  bankName: {
    type: String,
    require: true,
    trim: true
  },

  accountNumber: {
    type: Number,
    require: true,
    trim: true
  },

  ABA: {
    type: String,
    required: true,
    trim: true
  }
});

const Bank = mongoose.model('Bank', bankSchema, 'banks');

module.exports = Bank;
