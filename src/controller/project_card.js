/* eslint-disable vars-on-top */
/* eslint-disable no-var */
const mongoose = require('mongoose');
const Project = require('../models/project_model');
const Client = require('../models/client_model');
const FAQ = require('../models/faq_model');

// ENGINEER VIEWS PROJECT CARD

exports.project_card = async (req, res) => {
  try {
    var faq;

    const project = await Project.findById({ _id: req.params.id }).orFail(
      new Error('no project found')
    );

    const client = await Client.findById({
      _id: mongoose.Types.ObjectId(project.clientID)
    });

    // // GET THE DOCUMENTS
    // if (req.query.signed) {
    //   project_documents = await Documents.find({ signed: true })
    //     .where('projectID')
    //     .equals(project._id);
    // } else {
    //   project_documents = await Documents.find({ signed: true })
    //     .where('projectID')
    //     .equals(project._id);
    // }

    // GET THE FAQ

    if (!req.query.closed) {
      faq = await FAQ.getFAQS(project.id, false);
    } else {
      faq = await FAQ.getFAQS(project.id, true);
    }

    res.status(200).send({
      project,
      faq,
      clientName: client.username,
      clientAvatar: client.avatar
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

//  ENGINEER POSTS A QUESTION

exports.engineer_postsQuestion = async (req, res) => {
  try {
    const engineerQuestion = await FAQ.findOne({
      projectID: req.params.id
    }).orFail(new Error('no such project present'));

    engineerQuestion.faqs.push({
      engineerID: req.engnr.id,
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...req.body.faqs
    });

    await engineerQuestion.save();

    res.status(200).send({ message: 'Question has been posted' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
