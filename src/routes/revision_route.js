const express = require('express');
const auth = require('../middleware/auth');
const revisionController = require('../controller/revision');

const Router = new express.Router();

// GET REVISION DETAILS
Router.route('/revision/:id').get(
  auth,
  revisionController.get_revision_details
);

// ACCEPTING REVISION DETAIL WITHOUT A BID
Router.route('/revision/accept/:id').patch(
  auth,
  revisionController.accepting_revision_details
);

// BID ON A REVISION PROJECT
Router.route('/revision/bid/:id').post(auth, revisionController.revision_bid);

// REBID ON A REVISION PROJECT
Router.route('/revision/rebid/:id').patch(
  auth,
  revisionController.revision_rebid
);

module.exports = Router;
