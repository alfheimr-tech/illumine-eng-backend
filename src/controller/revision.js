/* eslint-disable vars-on-top */
/* eslint-disable no-var */

const { uuid } = require('uuidv4');
const Revision = require('../models/revision_model');
const { upload_docs } = require('../service');

// LIST OUT ALL THE REVISON PROJECT DETAILS

exports.get_revision_details = async (req, res) => {
  try {
    const revision = await Revision.findOne({
      projectID: req.params.id
    });

    await revision.append_url(revision.revisions);

    res.status(200).send(revision);
  } catch (error) {
    res.send({ error: error.message });
  }
};

// ACCEPTING THE REVISION WITHOUD CHARGING THE CLIENT

exports.accepting_revision_details = async (req, res) => {
  try {
    await Revision.findOneAndUpdate(
      { 'revisions._id': req.params.id },
      {
        $set: {
          'revisions.$.status': 'ongoing',
          'revisions.$.revisionBidAmount': 0
        }
      }
    );

    res.status(200).send('revision detail accepted');
  } catch (error) {
    res.send({ error: error.message });
  }
};

// BIDDING ON THE REVISION DETAIL

exports.revision_bid = async (req, res) => {
  try {
    await Revision.findOneAndUpdate(
      { 'revisions._id': req.params.id },
      {
        $set: {
          'revisions.$.revisionBidAmount': req.body.revisionBidAmount
        }
      }
    );

    res.status(200).send('Bid placed');
  } catch (error) {
    res.send({ error: error.message });
  }
};

// REBIDDING ON THE REVISION DETAIL

exports.revision_rebid = async (req, res) => {
  try {
    await Revision.findOneAndUpdate(
      { 'revisions._id': req.params.id },
      {
        $set: {
          'revisions.$.revisionBidAmount': req.body.revisionBidAmount,
          'revisions.$.status': 'bid'
        }
      }
    );

    res.status(200).send('Rebid placed');
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
    );

    await revision.append_url(revision.revisions);

    res.send(revision);
  } catch (error) {
    res.status(400).send('fail');
  }
};
