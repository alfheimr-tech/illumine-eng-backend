const express = require('express');
require('./src/db/mongoose');
const cors = require('cors');
const Engineer_Router = require('./src/routes/engineer_routes');
const Project_Router = require('./src/routes/project_route');
const ProjectCard_Router = require('./src/routes/project_card_route');
const Revision_Router = require('./src/routes/revision_route');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

app.use('/api/engineer', Engineer_Router);
app.use('/api/engineer', Project_Router);
app.use('/api/engineer', ProjectCard_Router);
app.use('/api/engineer', Revision_Router);

module.exports = app;
