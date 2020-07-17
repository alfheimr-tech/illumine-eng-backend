const mongoose = require('mongoose');

const projectdocsSchema = new mongoose.Schema({
  projectID: {
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

const Project_Docs = mongoose.model('Project_Docs', projectdocsSchema, 'docs');

module.exports = Project_Docs;
