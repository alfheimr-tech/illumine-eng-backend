const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  projectID: {
    type: mongoose.Schema.Types.ObjectId
  },
  bids: [
    {
      engineerID: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref: 'Engineer'
      },
      bidAmount: {
        type: Number
      },
      splitUp: {
        type: String
      },
      rebid: {
        type: Boolean,
        default: false
      },
      rebidReason: {
        type: String
      },
      engineerAction: {
        type: Boolean,
        default: false
      },
      active: {
        type: Boolean,
        default: true
      },
      accepted: {
        type: Boolean,
        default: false
      }
    }
  ]
});

const BidHistory = mongoose.model('BidHistory', bidSchema, 'bids');

module.exports = BidHistory;
