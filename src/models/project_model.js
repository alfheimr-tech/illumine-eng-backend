const mongoose = require('mongoose');
// const Client = require('../models/client_model');

const projectSchema = new mongoose.Schema(
  {
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
    },

    revisionStatus: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// GET MATCHED PROJECT STATUS

projectSchema.statics.getMatched = function(status, match) {
  if (status === 'ongoing') match.status = 'ongoing';
  else if (status === 'under revision') match.status = 'under revision';

  return match;
};

const Project = mongoose.model('Project', projectSchema, 'projects');

module.exports = Project;
