const express = require('express');
require('./src/db/mongoose');
const Engineer_Router = require('./src/routes/engineer_routes');
const Project_Router = require('./src/routes/project_route');
const ProjectCard_Router = require('./src/routes/project_card_route');

const app = express();

app.use(express.json());

app.use('/api/engineer', Engineer_Router);
app.use('/api/engineer', Project_Router);
app.use('/api/engineer', ProjectCard_Router);

module.exports = app;
