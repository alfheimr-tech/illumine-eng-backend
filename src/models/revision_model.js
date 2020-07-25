const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema(
  {
    projectID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
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

        date: {
          type: Date
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

// revisionSchema.methods.append_url = async revision => {
//   for (let i = 0; i < revision.length; i++) {
//     for (let j = 0; j < revision[i].docs.length; j++) {
//       if (revision[i].docs[j].docType === 'client') {
//         revision[i].docs[
//           j
//         ].Key = `https://illudev.s3.ap-south-1.amazonaws.com/${revision[i].docs[j].Key}`;
//       } else {
//         revision[i].docs[
//           j
//         ].Key = `https://sushu-bucket.s3.ap-south-1.amazonaws.com/${revision[i].docs[j].Key}`;
//       }
//     }
//   }
// };

const Revision = mongoose.model('Revision', revisionSchema, 'revisions');

module.exports = Revision;
