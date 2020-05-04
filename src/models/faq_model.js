const mongoose = require('mongoose');

var faq;

const faqSchema = new mongoose.Schema({
  projectID: {
    type: mongoose.Schema.Types.ObjectId
  },

  faqs: [
    {
      engineerID: {
        type: mongoose.Schema.Types.ObjectId
      },

      question: {
        type: String
      },

      answer: {
        type: String
      }
    }
  ]
});

faqSchema.statics.getFAQS = async function(ID, boolean) {
  // eslint-disable-next-line no-use-before-define
  faq = await FAQ.aggregate([
    {
      $match: {
        projectID: mongoose.Types.ObjectId(ID)
      }
    },
    {
      $unwind: '$faqs'
    },
    {
      $match: {
        'faqs.answer': { $exists: boolean }
      }
    },
    {
      $project: {
        projectID: 0,
        _id: 0
      }
    }
  ]);

  return faq;
};

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
