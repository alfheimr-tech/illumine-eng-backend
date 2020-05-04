const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  clientID: {
    type: mongoose.Schema.Types.ObjectId
  },

  projectName: {
    type: String,
    trim: true
  },

  licenseType: {
    type: String,
    trim: true,
    lowercase: true
  },

  location: {
    type: String,
    lowercase: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  active: {
    type: Boolean
  },

  projectType: {
    type: String,
    default: 'public'
  },

  status: {
    type: String,
    default: 'open'
  },

  budget: {
    type: Number
  },

  duration: {
    type: Number
  },

  engineerID: {
    type: mongoose.Schema.Types.ObjectId
  },

  totalBids: {
    type: Number,
    default: 0
  }
});

// GET MATCHED PROJECT STATUS

projectSchema.statics.getMatched = function(status) {
  if (status === 'ongoing') status = 'ongoing';
  else status = 'under revision';

  return status;
};

const Project = mongoose.model('Project', projectSchema, 'projects');

module.exports = Project;
