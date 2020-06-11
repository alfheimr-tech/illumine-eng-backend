const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
    ref: 'Project'
  },

  bids: [
    {
      engineerID: {
        type: mongoose.Schema.Types.ObjectId,
        trim: true
      },

      rebid: {
        type: Boolean,
        default: false
      },

      rebidReason: {
        type: String
      },

      bidAmount: {
        type: Number,
        trim: true
      },

      splitUp: {
        type: String,
        trim: true
      },

      active: {
        type: Boolean,
        default: true
      },

      engineerAction: {
        type: Boolean,
        default: false
      }
    }
  ]
});

const BidHistory = mongoose.model('BidHistory', bidSchema, 'bids');

module.exports = BidHistory;
