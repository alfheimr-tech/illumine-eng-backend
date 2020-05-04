const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Engineers = require('../../src/models/engineer_model');
const Banks = require('../../src/models/bank_model');
const Projects = require('../../src/models/project_model');
const BidHistory = require('..//../src/models/bid_model');
const FAQ = require('../../src/models/faq_model');

afterAll(async () => {
  await Engineers.deleteMany();
  await Banks.deleteMany();
  await Projects.deleteMany();
  await BidHistory.deleteMany();
  await FAQ.deleteMany();

  await mongoose.disconnect();
  await mongoose.connection.close();
});

const engineerOne = {
  email: 'sushmit@gmail.com',
  password: 'sushmit@2020'
};

const engineerID = new mongoose.Types.ObjectId();

const conEngnrID = new mongoose.Types.ObjectId();
const tokenTwo = jwt.sign(
  { id: conEngnrID.toString() },
  process.env.JWT_SECRET
);

const engineerTwo = {
  _id: engineerID,
  email: 'sush@venkat.com',
  password: 'hallelujiah',
  profession: [
    {
      location: 'mumbai',
      licence: 'civil'
    }
  ],
  tokens: [jwt.sign({ _id: engineerID.toString() }, process.env.JWT_SECRET)]
};

const projectOne = {
  projectType: 'public',
  status: 'open',
  projectName: 'test 1',
  licenseType: 'mechanical',
  location: 'mumbai',
  description: 'Lorem ipsum, or lipsum as it is sometimes known as -----',
  duration: 23
};

const projectTwo = {
  projectType: 'public',
  status: 'open',
  projectName: 'test 2',
  licenseType: 'civil',
  location: 'mumbai',
  description: 'Lorem ipsum, or lipsum as it is sometimes known as -----',
  duration: 14
};

const projectThree = {
  engineerID: engineerID,
  projectType: 'public',
  status: 'completed',
  projectName: 'test 3',
  licenseType: 'civil',
  location: 'mumbai',
  description: 'Lorem ipsum, or lipsum as it is sometimes known as -----',
  duration: 14
};

const projectFour = {
  engineerID: engineerID,
  projectType: 'public',
  status: 'ongoing',
  projectName: 'test 4',
  licenseType: 'civil',
  location: 'chennai',
  description: 'Lorem ipsum, or lipsum as it is sometimes known as -----',
  duration: 14
};

const projectFive = {
  engineerID: engineerID,
  projectType: 'public',
  status: 'under revision',
  projectName: 'test 5',
  licenseType: 'cs',
  location: 'mumbai',
  description: 'Lorem ipsum, or lipsum as it is sometimes known as -----',
  duration: 14
};

module.exports = {
  engineerOne,
  engineerTwo,
  projectOne,
  projectTwo,
  projectThree,
  projectFour,
  projectFive,
  tokenTwo
};
