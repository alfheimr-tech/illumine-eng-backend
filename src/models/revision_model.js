const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema(
  {
    projectID: {
      type: mongoose.Schema.Types.ObjectId
    },

    revisions: [
      {
        revisonDetail: {
          type: String,
          trim: true
        },

        status: {
          type: String,
          trim: true,
          default: 'open'
        },

        rebid: {
          type: Boolean,
          default: false
        },

        bidReason: {
          type: String,
          trim: true
        },

        revisionBidAmount: {
          type: Number
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Revision = mongoose.model('Revision', revisionSchema, 'revisions');

module.exports = Revision;
