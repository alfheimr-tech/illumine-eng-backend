/* eslint-disable no-undef */
// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const app = require('../app');
const {
  engineerTwo,
  projectOne,
  projectTwo,
  projectThree,
  projectFour,
  projectFive,
  tokenTwo
} = require('./db_setup/db');

const Project = require('../src/models/project_model');
const Engineer = require('../src/models/engineer_model');
const BidHistory = require('../src/models/bid_model');

beforeAll(async done => {
  await new Project(projectOne).save();
  await new Project(projectTwo).save();
  await new Project(projectThree).save();
  await new Project(projectFour).save();
  await new Project(projectFive).save();

  await new Engineer(engineerTwo).save();

  done();
});

describe('ENGINEER VIEWS PROJECTS', () => {
  test('1.browse projects', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/browse/project')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('sent');
      expect(response.body.projects.length).toBe(1);

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.browse project with location filter', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/browse/project?location=mumbai')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('sent');
      expect(response.body.project.length).toBe(1);

      done();
    } catch (error) {
      done(error);
    }
  });

  test('3.browse project with licence filter', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/browse/project?licence=civil')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('sent');
      expect(response.body.project.length).toBe(1);

      done();
    } catch (error) {
      done(error);
    }
  });

  test('4.browse project with location and licence filter', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/browse/project?location=mumbai&licence=civil')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('sent');
      expect(response.body.project.length).toBe(1);

      done();
    } catch (error) {
      done(error);
    }
  });

  test('5.browse project with with unavailable location or licence filter', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/browse/project?location=porto&licence=civil')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('no data present');

      done();
    } catch (error) {
      done(error);
    }
  });

  test('6.Un-Authenticated user not allowed to browse project', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/browse/project?location=porto&licence=civil')
        .set('Authorization', `Bearer ${tokenTwo}`)
        .send();

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('no user found');

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER BIDS ON A PROJECT', () => {
  test('1.engineer bids on a project', async done => {
    try {
      const project = await Project.findOne({
        projectName: 'test 2'
      });

      await new BidHistory({
        projectID: project._id
      }).save();

      const response = await request(app)
        .post(`/api/engineer/bid/${project.id}`)
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send({
          bids: {
            bidAmount: 40000,
            splitUp: 'sushmit'
          }
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('bid submitted');

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.engineer bids on the same project again ', async done => {
    try {
      const project = await Project.findOne({
        projectName: 'test 2'
      });

      const response = await request(app)
        .post(`/api/engineer/bid/${project.id}`)
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send({
          bids: {
            bidAmount: 30000,
            splitUp: 'sushmit'
          }
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe(
        'You have already placed a bid on this project! Bid can be placed only once on each project'
      );

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER VIEWS ALL HIS BIDS', () => {
  test('1.engineer views all his active bids', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/active/bids')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.activebid.length).toBe(1);

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER REBIDS ON A PROJECT', () => {
  test('1.engineer rebids', async done => {
    const project = await Project.findOne({
      projectName: 'test 2'
    });

    const bid = await BidHistory.findOne();

    bid.bids[0].rebid = true;
    await bid.save();

    try {
      const response = await request(app)
        .post(`/api/engineer/rebid/${project.id}`)
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send({
          bids: {
            bidAmount: 15000
          }
        });

      expect(response.statusCode).toBe(202);
      expect(response.body.message).toBe('updated');

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.engineer cannot rebid twice', async done => {
    try {
      const project = await Project.findOne({
        projectName: 'test 2'
      });

      const response = await request(app)
        .post(`/api/engineer/rebid/${project.id}`)
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send({
          bids: {
            bidAmount: 25000
          }
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe(
        'You can place a rebid only once on each project'
      );

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER CANNOT VIEW ACTIVE BIDS', () => {
  test('1.engineer views all his active bids but none is present', async done => {
    try {
      await BidHistory.deleteMany();

      const response = await request(app)
        .get('/api/engineer/active/bids')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('no data present');

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER VIEWS ALL HIS COMPLETED PROJECTS', () => {
  test('1.engineer views all his completed projects', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/completed/project')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.project).toBeTruthy(); // ('No completed projects');

      await Project.findOneAndDelete({
        status: 'completed'
      });

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.engineer views all his completed projects but none is present', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/completed/project')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(400);
      expect(response.body.project).toBeFalsy();
      expect(response.body.error).toBe('No completed projects');

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER VIEWS ALL THE ACTIVE  PROJECTS', () => {
  test('1.engineer views all his active projects', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/active/project')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2);

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.engineer views all his ongoing active projects', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/active/project?status=ongoing')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].status).toBe('ongoing');

      done();
    } catch (error) {
      done(error);
    }
  });

  test('3.engineer views all his under revision active projects', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/active/project?status=under revision')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].status).toBe('under revision');

      done();
    } catch (error) {
      done(error);
    }
  });

  test('4.engineer views all his active projects filtered with location', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/active/project?location=mumbai')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].location).toBe('mumbai');

      done();
    } catch (error) {
      done(error);
    }
  });

  test('5.engineer views all his active projects filtered with licence', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/active/project?licence=civil')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].licenseType).toBe('civil');

      done();
    } catch (error) {
      done(error);
    }
  });

  test('6.engineer views all his active projects filtered with location and status', async done => {
    try {
      const response = await request(app)
        .get(
          '/api/engineer/active/project?location=mumbai&status=under revision'
        )
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].location).toBe('mumbai');
      expect(response.body[0].status).toBe('under revision');

      done();
    } catch (error) {
      done(error);
    }
  });

  test('7.engineer views all his active projects filtered with licence and status', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/active/project?licence=cs&status=under revision')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].licenseType).toBe('cs');
      expect(response.body[0].status).toBe('under revision');

      done();
    } catch (error) {
      done(error);
    }
  });

  test('8.engineer views all his active projects filtered with location and licence', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/active/project?location=mumbai&licence=cs')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].location).toBe('mumbai');
      expect(response.body[0].status).toBe('under revision');
      expect(response.body[0].licenseType).toBe('cs');

      done();
    } catch (error) {
      done(error);
    }
  });

  test('9.engineer views all his active projects filtered with location , licence and status', async done => {
    try {
      const response = await request(app)
        .get(
          '/api/engineer/active/project?location=mumbai&licence=cs&status=under revision'
        )
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].location).toBe('mumbai');
      expect(response.body[0].status).toBe('under revision');
      expect(response.body[0].licenseType).toBe('cs');

      done();
    } catch (error) {
      done(error);
    }
  });

  test('10.engineer tries to view all his active projects but there isnt any', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/active/project?location=mumbai&licence=civil')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('could not find any active project');

      done();
    } catch (error) {
      done(error);
    }
  });
});
