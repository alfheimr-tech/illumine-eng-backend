const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId
  },

  notifications: [
    {
      senderID: {
        type: mongoose.Schema.Types.ObjectId
      },

      content: {
        type: String
      },

      projectID: {
        type: mongoose.Schema.Types.ObjectId
      }
    }
  ]
});

const Notifications = mongoose.model('Ntifications', notificationSchema);

module.exports = Notifications;
