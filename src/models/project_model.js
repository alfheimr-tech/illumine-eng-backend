const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    clientID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    projectName: {
      type: String,
      trim: true
    },
    licenseType: {
      type: String,
      trim: true
      // enum: ['civil', 'cs', 'mechanical']
    },
    location: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    projectType: {
      type: String,
      default: 'public',
      enum: ['private', 'public']
    },
    status: {
      type: String,
      default: 'open',
      enum: ['open', 'ongoing', 'completed']
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
  },
  {
    timestamps: true
  }
);

// GET MATCHED PROJECT STATUS

projectSchema.statics.getMatched = function(status) {
  if (status === 'ongoing') status = 'ongoing';
  else status = 'under revision';

  return status;
};

const Project = mongoose.model('Project', projectSchema, 'projects');

module.exports = Project;
