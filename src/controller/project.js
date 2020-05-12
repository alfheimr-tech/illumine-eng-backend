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

exports.browse_projects = async (req, res) => {
  try {
    var match = {};

    match.location = [];
    match.licence = [];

    var locationArray = [];
    var licenceArray = [];
    var i = null;

    // eslint-disable-next-line no-shadow
    await req.engnr.profession.forEach(i => {
      locationArray.push(i.location);
      licenceArray.push(i.licence);
    });

    console.log(locationArray);

    if (req.query.location || req.query.licence) {
      if (req.query.location && !req.query.licence) {
        i = locationArray.indexOf(req.query.location);

        match.status = 'open';
        match.location[0] = req.query.location;
        match.licence[0] = licenceArray[i];
      } else if (req.query.licence && !req.query.location) {
        i = licenceArray.indexOf(req.query.licence);

        match.status = 'open';
        match.location[0] = locationArray[i];
        match.licence[0] = req.query.licence;
      } else {
        match.status = 'open';
        match.location[0] = req.query.location;
        match.licence[0] = req.query.licence;
      }
    } else {
      for (i = 0; i < locationArray.length; i++) {
        match.status = 'open';
        match.location[i] = locationArray[i];
        match.licence[i] = licenceArray[i];
      }
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
          $and: [
            {
              'project.status': match.status,
              'project.location': { $in: match.location },
              'project.licenseType': { $in: match.licence }
            }
          ]
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
          totalbids_received: 1,
          project: {
            $map: {
              input: '$project',
              as: 'pro',
              in: {
                name: '$$pro.projectName',
                licence: '$$pro.licenseType',
                location: '$$pro.location'
              }
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
