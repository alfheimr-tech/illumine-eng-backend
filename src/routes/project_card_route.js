const express = require('express');
const auth = require('../middleware/auth');
const Project_cardController = require('../controller/project_card');

const Router = new express.Router();

// ENGINEER VIEWS THE PROJECT
Router.route('/project/card/:id').get(
  auth,
  Project_cardController.project_card
);

// ENGINEER POSTS A QUESTION
Router.route('/post/:id').post(
  auth,
  Project_cardController.engineer_postsQuestion
);

// ENGINEER UPLOADS DOCS

Router.route('/docs/upload/:id')
  .post(auth, Project_cardController.engnr_uploads_projectdocs)
  .patch(auth, Project_cardController.update_project_docs);

module.exports = Router;
