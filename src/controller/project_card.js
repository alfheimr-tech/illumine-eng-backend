/* eslint-disable vars-on-top */
/* eslint-disable no-var */
const mongoose = require('mongoose');
const { uuid } = require('uuidv4');
const { upload_docs } = require('../service');
const Project = require('../models/project_model');
const Project_Docs = require('../models/projectDocs_model');
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

    // GET THE DOCUMENTS
    const project_docs = await Project_Docs.findOne({
      projectID: req.params.id
    });

    project_docs.docs.forEach(element => {
      if (element.docType === 'client') {
        element.Key = `https://illudev.s3.ap-south-1.amazonaws.com/${element.Key}`;
      } else {
        element.Key = `https://sushu-bucket.s3.ap-south-1.amazonaws.com/${element.Key}`;
      }
    });

    // GET THE FAQ

    if (!req.query.closed) {
      faq = await FAQ.getFAQS(project.id, false);
    } else {
      faq = await FAQ.getFAQS(project.id, true);
    }

    res.status(200).send({
      project,
      faq,
      project_docs,
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

// ENGINEER UPLOADS DOCUMENTS

exports.engnr_uploads_projectdocs = async (req, res) => {
  try {
    var documents = [];

    const s3 = upload_docs();

    const getUrl = async (fileDetail, key) => {
      return s3.getSignedUrl('putObject', {
        Bucket: 'sushu-bucket',
        Key: key,
        ContentType: fileDetail.fileType
      });
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const fileDetail of req.body.fileDetails) {
      const key = `${req.engnr.id}/${uuid()}.${fileDetail.extension}`;
      documents.push({
        // eslint-disable-next-line no-await-in-loop
        url: await getUrl(fileDetail, key),
        key,
        fileType: fileDetail.fileType,
        extension: fileDetail.extension
      });
    }

    res.status(201).send(documents);
  } catch (error) {
    res.status(400).send('fail');
  }
};

// SAVING THE DOCS

exports.update_project_docs = async (req, res) => {
  try {
    await Project_Docs.findOneAndUpdate(
      { projectID: req.params.id },
      {
        $push: {
          docs: {
            // eslint-disable-next-line node/no-unsupported-features/es-syntax
            ...req.body
          }
        }
      }
    );
    res.send({ message: 'docs saved' });
  } catch (error) {
    res.status(400).send('fail');
  }
};
