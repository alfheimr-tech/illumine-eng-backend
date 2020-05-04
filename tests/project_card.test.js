/* eslint-disable no-undef */
/* eslint-disable no-var */
// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { projectOne, engineerTwo } = require('./db_setup/db');
const Project = require('../src/models/project_model');
const Engineer = require('../src/models/engineer_model');
const FAQ = require('../src/models/faq_model');

beforeAll(async done => {
  await new Project(projectOne).save();
  await new Engineer(engineerTwo).save();

  done();
});

describe('engineer views the project card', () => {
  test('1.view project card', async done => {
    try {
      const project = await Project.findOne();

      const response = await request(app)
        .get(`/api/engineer/project/card/${project.id}`)
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.faq).toBeTruthy();
      expect(response.body.project).toBeTruthy();

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2. no such project exists', async done => {
    try {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/engineer/project/card/${id}`)
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('no project found');

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER POSTS A QUESTION', () => {
  test('1.posting a question', async done => {
    try {
      const project = await Project.findOne();

      await new FAQ({
        projectID: project.id
      }).save();

      const response = await request(app)
        .post(`/api/engineer/post/${project.id}`)
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send({
          faqs: {
            question: 'hi! how are you ? '
          }
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBeTruthy();

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.posting a question on an invalid project', async done => {
    try {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/engineer/post/${id}`)
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send({
          faqs: {
            question: 'hi! how are you ? '
          }
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBeFalsy();

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER VIEWS PROJECTS WITH QUESTIONS', () => {
  test('1.view project card with open questions', async done => {
    try {
      const project = await Project.findOne();

      const response = await request(app)
        .get(`/api/engineer/project/card/${project.id}`)
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.faq.length).toBe(1);
      expect(response.body.project).toBeTruthy();

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.view project card with question and answer both', async done => {
    try {
      const project = await Project.findOne();

      await FAQ.updateOne(
        {
          projectID: project.id
        },
        {
          $set: {
            'faqs.0.answer': 'im good'
          }
        }
      );

      const response = await request(app)
        .get(`/api/engineer/project/card/${project.id}?closed=true`)
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.faq).toBeTruthy();
      expect(response.body.project).toBeTruthy();

      done();
    } catch (error) {
      done(error);
    }
  });
});
