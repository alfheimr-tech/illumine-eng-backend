const mongoose = require('mongoose');
const { model } = require('./engineer_model');

const feedbackSchema = new mongoose.Schema({
  engineerID: {
    type: mongoose.Schema.Types.ObjectId
  },
  feedbacks: [
    {
      clientID: {
        type: mongoose.Schema.Types.ObjectId
      },

      projectID: {
        type: mongoose.Schema.Types.ObjectId
      },

      feedback: {
        type: String,
        trim: true
      }
    }
  ]
});

const Feedback = mongoose.model('Feedback', feedbackSchema, 'feedbacks');

module.exports = Feedback;
