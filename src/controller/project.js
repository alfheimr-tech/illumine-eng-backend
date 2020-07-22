/* eslint-disable dot-notation */
/* eslint-disable prefer-destructuring */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-shadow */
/* eslint-disable node/no-unsupported-features/es-syntax */
const mongoose = require('mongoose');
const { uuid } = require('uuidv4');
const { upload_docs } = require('../service');
const Project = require('../models/project_model');
const BidHistory = require('../models/bid_model');
const Project_Docs = require('../models/projectDocs_model');

// ENGINEER BROWSES ALL THE PROJECTS IN OPEN STATE

exports.browse_projects = async (req, res) => {
  try {
    var match = [];

    if (req.query.location || req.query.licence) {
      if (req.query.location && !req.query.licence) {
        req.engnr.profession = req.engnr.profession.filter(e => {
          return e.location === req.query.location;
        });

        req.engnr.profession.forEach(e => {
          match.push({
            status: 'open',
            location: e.location,
            licenseType: e.licence
          });
        });
      } else if (req.query.licence && !req.query.location) {
        req.engnr.profession = req.engnr.profession.filter(e => {
          return e.licence === req.query.licence;
        });

        req.engnr.profession.forEach(e => {
          match.push({
            status: 'open',
            location: e.location,
            licenseType: e.licence
          });
        });
      } else {
        match.push({
          status: 'open',
          location: req.query.location,
          licenseType: req.query.licence
        });
      }
    } else {
      req.engnr.profession.forEach(e => {
        match.push({
          status: 'open',
          location: e.location,
          licenseType: e.licence
        });
      });
    }

    const project = await BidHistory.aggregate([
      {
        $match: {
          'bids.engineerID': { $ne: mongoose.Types.ObjectId(req.engnr.id) }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectID',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $match: {
          project: {
            $elemMatch: {
              $or: match
            }
          }
        }
      },
      {
        $project: {
          bids: 0,
          projectID: 0,
          _id: 0,
          __v: 0
        }
      }
    ]);

    res.status(200).send(project);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// ENGINEERS BIDS ON PROJECT

exports.engineers_projectbid = async (req, res) => {
  try {
    const bid_project = await BidHistory.findOne({
      projectID: req.params.id
    });

    // total bids update //

    bid_project.bids.push({
      ...req.body.bids,
      engineerID: req.engnr.id
    });

    await bid_project.save();

    res.status(200).send({ message: 'bid submitted' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
// ENGINEER VIEWS ALL ACTIVE PROJECTS

exports.active_projects = async (req, res) => {
  try {
    // eslint-disable-next-line vars-on-top
    var match = {};
    // eslint-disable-next-line vars-on-top
    var status = null;
    var location = null;
    var licenseType = null;
    match['$and'] = [];

    if (req.query.location || req.query.licence) {
      if (req.query.location && !req.query.licence) {
        location = req.query.location;
        if (req.query.status) {
          // eslint-disable-next-line no-const-assign
          status = await Project.getMatched(req.query.status);
          match['$and'].push(
            { engineerID: req.engnr.id },
            { status },
            { location }
          );
        } else {
          match['$and'].push(
            { engineerID: req.engnr.id },
            { location },
            { status: { $ne: 'completed' } }
          );
        }
      } else if (req.query.licence && !req.query.location) {
        licenseType = req.query.licence;
        // eslint-disable-next-line no-lonely-if
        if (req.query.status) {
          status = await Project.getMatched(req.query.status);
          match['$and'].push(
            { engineerID: req.engnr.id },
            { status },
            { licenseType }
          );
        } else {
          match['$and'].push(
            { engineerID: req.engnr.id },
            { licenseType },
            { status: { $ne: 'completed' } }
          );
        }
      } else {
        licenseType = req.query.licence;
        // eslint-disable-next-line prefer-destructuring
        location = req.query.location;
        // eslint-disable-next-line no-lonely-if
        if (req.query.status) {
          status = await Project.getMatched(req.query.status);
          match['$and'].push(
            { engineerID: req.engnr.id },
            { status },
            { location },
            { licenseType }
          );
        } else {
          match['$and'].push(
            { engineerID: req.engnr.id },
            { location },
            { licenseType },
            { status: { $ne: 'completed' } }
          );
        }
      }
    } else if (req.query.status) {
      status = await Project.getMatched(req.query.status);
      match['$and'].push({ engineerID: req.engnr.id }, { status });
    } else {
      match['$and'].push(
        { engineerID: req.engnr.id },
        { status: { $ne: 'completed' } }
      );
    }

    const project = await Project.find(match);

    res.status(200).send(project);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// ENGINEERS VIEWS ALL PROJECTS HE HAS BIDDED

exports.active_bids = async (req, res) => {
  try {
    const activebid = await BidHistory.aggregate([
      {
        $match: {
          bids: {
            $elemMatch: {
              engineerID: mongoose.Types.ObjectId(req.engnr.id),
              active: true
            }
          }
        }
      },
      {
        $set: {
          totalbids_received: {
            $size: '$bids'
          }
        }
      },
      {
        $unwind: '$bids'
      },
      {
        $match: {
          'bids.engineerID': mongoose.Types.ObjectId(req.engnr.id)
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectID',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $project: {
          bids: 1,
          totalbids_received: 1,
          project: {
            $map: {
              input: '$project',
              as: 'pro',
              in: {
                name: '$$pro.projectName',
                licence: '$$pro.licenseType',
                location: '$$pro.location',
                staus: '$$pro.status',
                duration: '$$pro.duration',
                description: '$$pro.description'
              }
            }
          }
        }
      }
    ]);

    res.status(200).send({ message: 'sent', activebid });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// ENGINEER VIEWS ALL HIS COMPLETED PROJECTS

exports.completed_projects = async (req, res) => {
  try {
    const project = await Project.find({
      status: 'completed',
      engineerID: req.engnr.id
    });

    res.status(200).send({ project });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

//  ENGINEER REBIDS ON A PROJECT

exports.engineer_rebids = async (req, res) => {
  try {
    const bid = await BidHistory.findOneAndUpdate(
      {
        projectID: req.params.id,
        bids: { $elemMatch: { engineerID: req.engnr.id, active: true } }
      },
      {
        $set: {
          'bids.$.engineerAction': true,
          'bids.$.splitUp': req.body.bids.splitUp,
          'bids.$.bidAmount': req.body.bids.bidAmount
        }
      },
      {
        new: true
      }
    );

    res.status(202).send({ message: 'updated', bid });
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

exports.update_project_docs = async (req, res) => {
  try {
    await Project_Docs.findOneAndUpdate(
      { 'docs._id': req.params.id },
      {
        $push: {
          'docs.$.docs': {
            Key: req.body.Key,
            extension: req.body.extension,
            docType: req.body.docType,
            url: req.body.url
          }
        }
      }
    );
    res.send({ message: 'docs saved' });
  } catch (error) {
    res.status(400).send('fail');
  }
};
