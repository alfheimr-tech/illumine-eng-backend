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

        bidReason: {
          type: String,
          trim: true
        },

        revisionBidAmount: {
          type: Number
        },

        docs: [
          {
            Key: {
              type: String,
              required: true
            },
            extension: {
              type: String,
              required: true
            },
            url: {
              type: String,
              required: true
            },
            docType: {
              type: String,
              required: true,
              enum: ['client', 'engineer']
            }
          }
        ]
      }
    ]
  },
  {
    timestamps: true
  }
);

const Revision = mongoose.model('Revision', revisionSchema, 'revisions');

module.exports = Revision;
