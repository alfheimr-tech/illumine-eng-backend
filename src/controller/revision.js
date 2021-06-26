/* eslint-disable vars-on-top */
/* eslint-disable no-var */
const { uuid } = require('uuidv4');
const Revision = require('../models/revision_model');
const { upload_docs } = require('../service');

const { sendEmailNotification } = require('../email/account');
const Client = require('../models/client_model');

// eslint-disable-next-line no-undef
urlFormatter = revision => {
  for (let i = 0; i < revision.length; i++) {
    for (let j = 0; j < revision[i].docs.length; j++) {
      if (revision[i].docs[j].docType.match('client')) {
        revision[i].docs[
          j
        ].Key = `https://illudev.s3.ap-south-1.amazonaws.com/${revision[i].docs[j].Key}`;
      } else {
        revision[i].docs[
          j
        ].Key = `https://sushu-bucket.s3.ap-south-1.amazonaws.com/${revision[i].docs[j].Key}`;
      }
    }
  }
};

// LIST OUT ALL THE REVISON PROJECT DETAILS

exports.get_revision_details = async (req, res) => {
  try {
    const revision = await Revision.findOne({
      projectID: req.params.id
    }).populate({
      path: 'projectID',
      select: 'projectName -_id'
    });

    await urlFormatter(revision.revisions);

    res.status(200).send({
      revision: revision.revisions,
      project_name: revision.projectID.projectName
    });
  } catch (error) {
    res.send({ error: error.message });
  }
};

// ACCEPTING THE REVISION WITHOUD CHARGING THE CLIENT

exports.accepting_revision_details = async (req, res) => {
  try {
    const revision = await Revision.findOneAndUpdate(
      { 'revisions._id': req.params.id },
      {
        $set: {
          'revisions.$.status': 'ongoing',
          'revisions.$.revisionBidAmount': 0
        }
      },
      { new: true }
    ).populate({
      path: 'projectID',
      select: 'projectName -_id'
    });

    res.status(200).send({
      revision: revision.revisions,
      project_name: revision.projectID.projectName
    });
  } catch (error) {
    res.send({ error: error.message });
  }
};

// BIDDING ON THE REVISION DETAIL

exports.revision_bid = async (req, res) => {
  try {
    const revision = await Revision.findOneAndUpdate(
      { 'revisions._id': req.params.id },
      {
        $set: {
          'revisions.$.revisionBidAmount': req.body.revisionBidAmount,
          'revisions.$.bidReason': req.body.bidReason,
          'revisions.$.status': 'bid'
        }
      },
      {
        new: true
      }
    ).populate({
      path: 'projectID',
      select: 'projectName clientID -_id'
    });

    const client = await Client.findOne({ _id: revision.projectID.clientID });

    sendEmailNotification(client.email, `Bid received on the revision request for ${revision.projectID.projectName} project.`, `Dear ${client.username},\nThe engineer has proposed a fee of $ ${req.body.revisionBidAmount} in response to the revision request you posted. Please review the same before responding.`);

    res.status(200).send({
      revision: revision.revisions,
      project_name: revision.projectID.projectName
    });
  } catch (error) {
    res.send({ error: error.message });
  }
};

// REBIDDING ON THE REVISION DETAIL

exports.revision_rebid = async (req, res) => {
  try {
    const revision = await Revision.findOneAndUpdate(
      { 'revisions._id': req.params.id },
      {
        $set: {
          'revisions.$.revisionBidAmount': req.body.revisionBidAmount,
          'revisions.$.bidReason': req.body.bidReason,
          'revisions.$.status': 'bid'
        }
      },
      {
        new: true
      }
    ).populate({
      path: 'projectID',
      select: 'projectName clientID -_id'
    });

    const client = await Client.findOne({ _id: revision.projectID.clientID });

    sendEmailNotification(client.email, `Rebid received on the revision request for ${revision.projectID.projectName} project.`, `Dear ${client.username},\nThe engineer has proposed a fee of $ ${req.body.revisionBidAmount} in response to the rebid request you posted. Please review the same before responding.`);

    res.status(200).send({
      revision: revision.revisions,
      project_name: revision.projectID.projectName
    });
  } catch (error) {
    res.send({ error: error.message });
  }
};

exports.upload_revision_docs = async (req, res) => {
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

exports.updateRevisionDocs = async (req, res) => {
  try {
    const revision = await Revision.findOneAndUpdate(
      { 'revisions._id': req.params.id },
      {
        $push: {
          'revisions.$.docs': {
            Key: req.body.Key,
            extension: req.body.extension,
            docType: req.body.docType,
            url: req.body.url
          }
        }
      },
      { new: true }
    ).populate({
      path: 'projectID',
      select: 'projectName -_id'
    });

    await urlFormatter(revision.revisions);

    res.send({
      revision: revision.revisions,
      project_name: revision.projectID.projectName
    });
  } catch (error) {
    res.status(400).send('fail');
  }
};
