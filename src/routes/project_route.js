const express = require('express');
const auth = require('../middleware/auth');
const ProjectController = require('../controller/project');

const Router = new express.Router();

// ENGINEER BROWSES PROJECT
Router.route('/browse/project').get(auth, ProjectController.browse_projects);

// ENGINEER VIEWS ALL HIS ACTIVE PROJECTS
Router.route('/active/project').get(auth, ProjectController.active_projects);

// ENGINEER BIDS ON AN OPEN PROJECT
Router.route('/bid/:id').post(auth, ProjectController.engineers_projectbid);

// ENGINEER VIEWS ALL HIS ACTIVE BIDS
Router.route('/active/bids').get(auth, ProjectController.active_bids);

// ENGINEER VIEWS ALL HIS COMEPLETED PROJECTS
Router.route('/completed/project').get(
  auth,
  ProjectController.completed_projects
);

// ENGINEER REBIDS ON A PROJECT
Router.route('/rebid/:id').post(auth, ProjectController.engineer_rebids);

// ENGINEER UPLOADS DOCS
Router.route('/docs/upload/:id')
  .post(auth, ProjectController.engnr_uploads_projectdocs)
  .patch(auth, ProjectController.update_project_docs);

module.exports = Router;
