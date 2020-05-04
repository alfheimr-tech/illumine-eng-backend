const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  engineerID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  copy_of_insurance: [
    {
      type: Buffer
    }
  ],

  portal_agreement: [
    {
      type: Buffer
    }
  ]
});

const Engineer_Docs = mongoose.model(
  'Engineer_Docs',
  documentSchema,
  'engineer_documents'
);

module.exports = Engineer_Docs;
