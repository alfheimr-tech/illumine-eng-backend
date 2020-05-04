/* eslint-disable dot-notation */
/* eslint-disable prefer-destructuring */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-shadow */
/* eslint-disable node/no-unsupported-features/es-syntax */
const mongoose = require('mongoose');
const Project = require('../models/project_model');
const BidHistory = require('../models/bid_model');

// ENGINEER BROWSES ALL THE PROJECTS IN OPEN STATE

var locationArray = [];
var licenceArray = [];
var projects = [];
var i;
exports.browse_projects = async (req, res) => {
  try {
    locationArray = [];
    licenceArray = [];
    projects = [];

    // eslint-disable-next-line no-shadow
    await req.engnr.profession.forEach(i => {
      locationArray.push(i.location);
      licenceArray.push(i.licence);
    });

    if (req.query.location || req.query.licence) {
      if (req.query.location && !req.query.licence) {
        i = locationArray.indexOf(req.query.location);

        const project = await Project.find({
          location: req.query.location,
          licenseType: licenceArray[i],
          status: 'open'
        })
          .sort({ createdAt: -1 })
          .orFail(new Error('no data present'));

        return res.status(200).send({ message: 'sent', project });
        // eslint-disable-next-line no-else-return
      } else if (req.query.licence && !req.query.location) {
        i = licenceArray.indexOf(req.query.licence);

        const project = await Project.find({
          location: locationArray[i],
          licenseType: req.query.licence,
          status: 'open'
        })
          .sort({ createdAt: -1 })
          .orFail(new Error('no data present'));

        return res.status(200).send({ message: 'sent', project });
      } else {
        const project = await Project.find({
          location: req.query.location,
          licenseType: req.query.licence,
          status: 'open'
        })
          .sort({ createdAt: -1 })
          .orFail(new Error('no data present'));

        return res.status(200).send({ message: 'sent', project });
      }

      // eslint-disable-next-line no-else-return
    } else {
      for (i = 0; i < locationArray.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        const project = await Project.find({
          location: locationArray[i],
          licenseType: licenceArray[i],
          status: 'open'
        })
          .sort({ createdAt: -1 })
          .orFail(new Error('no data present'));

        projects.push(project);
      }

      res.status(200).send({ message: 'sent', projects });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// ENGINEERS BIDS ON PROJECT

exports.engineers_projectbid = async (req, res) => {
  try {
    const isValid = await BidHistory.find({
      projectID: req.params.id,
      bids: {
        $elemMatch: { engineerID: req.engnr.id }
      }
    });

    if (isValid.length !== 0) {
      throw new Error(
        'You have already placed a bid on this project! Bid can be placed only once on each project'
      );
    } else {
      const bid_project = await BidHistory.findOne({
        projectID: req.params.id
      });

      bid_project.bids.push({
        ...req.body.bids,
        engineerID: req.engnr.id
      });

      await bid_project.save();
      res.status(200).send({ message: 'bid submitted' });
    }
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

    const project = await Project.find(match).orFail(
      new Error('could not find any active project')
    );

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
          project: {
            $map: {
              input: '$project',
              as: 'pro',
              in: [
                {
                  name: '$$pro.projectName',
                  description: '$$pro.description',
                  location: '$$pro.location',
                  license: '$$pro.licenseType',
                  status: '$$pro.status'
                }
              ]
            }
          }
        }
      }
    ]);

    if (activebid.length === 0) throw new Error('no data present');

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
    }).orFail(new Error('No completed projects'));

    res.status(200).send({ project });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

//  ENGINEER REBIDS ON A PROJECT

exports.engineer_rebids = async (req, res) => {
  try {
    const check_rebid = await BidHistory.findOne({
      projectID: req.params.id,
      bids: {
        $elemMatch: { engineerID: req.engnr.id, rebid: false }
      }
    });

    if (check_rebid) {
      throw new Error('You can place a rebid only once on each project');
    }

    await BidHistory.updateOne(
      {
        projectID: req.params.id,
        bids: { $elemMatch: { engineerID: req.engnr.id, active: true } }
      },
      {
        $set: {
          'bids.$.rebid': false,
          'bids.$.bidAmount': req.body.bids.bidAmount
        }
      }
    );

    res.status(202).send({ message: 'updated' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
