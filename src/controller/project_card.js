const Project = require('../models/project_model');
const FAQ = require('../models/faq_model');

// ENGINEER VIEWS PROJECT CARD

exports.project_card = async (req, res) => {
  try {
    const project = await Project.findById({ _id: req.params.id }).orFail(
      new Error('no project found')
    );

    // eslint-disable-next-line vars-on-top
    var faq;
    // var project_documents;

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

    res.status(200).send({ project, faq });
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
