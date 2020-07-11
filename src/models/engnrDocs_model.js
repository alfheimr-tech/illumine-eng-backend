const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  engineerID: {
    type: mongoose.Schema.Types.ObjectId,
    trim: true
  },

  docs: [
    {
      Key: {
        type: String,
        trim: true
      },

      extension: {
        type: String,
        trim: true
      },

      docType: {
        type: String,
        trim: true
      },

      url: {
        type: String,
        trim: true
      }
    }
  ]
});

const Engineer_Docs = mongoose.model(
  'Engineer_Docs',
  documentSchema,
  'engnr_docs'
);

module.exports = Engineer_Docs;
