/* eslint-disable no-undef */
// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const crypto = require('crypto');
const app = require('../app');
const Engineer = require('../src/models/engineer_model');

const { engineerOne, engineerTwo } = require('./db_setup/db');

// eslint-disable-next-line vars-on-top
var engnr = null;

describe('SIGNING UP A NEW ENGINEER', () => {
  test('1.signing up with valid credentials', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/signup')
        .send({
          email: engineerOne.email,
          password: engineerOne.password
        });

      expect(response.statusCode).toBe(201);
      expect(this.password).not.toBe('sushmit@2020');
      expect(response.body.token).toBeTruthy();
      expect(response.body.message).toBeTruthy();

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.signing up with an already registered mail', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/signup')
        .send({
          email: engineerOne.email,
          password: engineerOne.password
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBeTruthy();

      done();
    } catch (error) {
      done(error);
    }
  });

  test('3.signing up without entering a valid password', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/signup')
        .send({
          email: 'athira@gmail.com'
        });

      expect(response.body.error).toBeTruthy();
      expect(response.statusCode).toBe(400);

      done();
    } catch (error) {
      done(error);
    }
  });

  test('4.signing up without entering a valid email id', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/signup')
        .send({
          email: 'idkwhatthisis',
          password: engineerOne.password
        });

      expect(response.body.error).toBeTruthy();
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Engineer validation failed: email: please put a valid email!'
      });

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER VERIFYING HIS EMAIL', () => {
  test('1.engineer verifies his email', async done => {
    engnr = await Engineer.findOne({
      email: engineerOne.email
    });

    const HashMock = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValueOnce(engnr.emailVerifyToken)
    };

    const createHashMock = jest
      .spyOn(crypto, 'createHash')
      .mockImplementationOnce(() => HashMock);

    try {
      const response = await request(app)
        .put(`/api/engineer/confirm_mail/${engnr.emailVerifyToken}`)
        .send();

      expect(createHashMock).toBeCalledWith('sha256');
      expect(response.statusCode).toBe(202);
      expect(response.body).toMatchObject({
        message: 'email verified'
      });

      createHashMock.mockRestore();

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.engineer cannot verify his email id', async done => {
    engnr = await Engineer.findOne({
      email: engineerOne.email
    });

    // invalid token created
    const token = crypto.randomBytes(24).toString('hex');

    try {
      const response = await request(app)
        .put(`/api/engineer/confirm_mail/${token}`)
        .send();

      expect(response.statusCode).toBe(400);

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEEER LOGGING IN', () => {
  test('1.logging in a registered engineer', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/login')
        .send({
          email: engineerOne.email,
          password: engineerOne.password
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeTruthy();

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.logging in an unregistered engineer', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/login')
        .send({
          email: 'xyz@gmail.com',
          password: 'zyz@2020'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.token).toBeFalsy();

      done();
    } catch (error) {
      done(error);
    }
  });

  test('3.logging in with a wrong password', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/login')
        .send({
          email: engineerOne.email,
          password: 'zyz@2020'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.token).toBeFalsy();
      expect(response.body).toMatchObject({
        error: 'wrong password!please enter the correct password'
      });

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER FORGOT HIS PASSWORD', () => {
  test('1.link will be sent to registered email id', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/forgot_password')
        .send({
          email: engineerOne.email
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        message: 'mail sent'
      });

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.link will not be sent to unregistered email id', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/forgot_password')
        .send({
          email: 'xyz@gmail.com'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Could not find any such registered User! please signup'
      });

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('RESET PASSWORD HAS BEEN INITIATED', () => {
  beforeAll(async () => {
    engnr = await Engineer.findOne({
      email: engineerOne.email
    });
  });
  test('1.engineer changes his password', async done => {
    try {
      const HashMock = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValueOnce(engnr.resetPasswordToken)
      };

      const createHashMock = jest
        .spyOn(crypto, 'createHash')
        .mockImplementationOnce(() => HashMock);

      const response = await request(app)
        .patch(`/api/engineer/reset/${engnr.resetPasswordToken}`)
        .send({
          password: 'sushmitchakraborty@2020'
        });

      expect(createHashMock).toBeCalledWith('sha256');
      expect(HashMock.digest).toBeCalledWith('hex');
      expect(response.statusCode).toBe(202);
      expect(response.body).toMatchObject({
        message: 'your new password has been set'
      });

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.engineer does not provide a valid password', async done => {
    try {
      const HashMock = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValueOnce(engnr.resetPasswordToken)
      };

      const createHashMock = jest
        .spyOn(crypto, 'createHash')
        .mockImplementationOnce(() => HashMock);

      const response = await request(app)
        .patch(`/api/engineer/reset/${engnr.resetPasswordToken}`)
        .send({
          password: 'sush'
        });

      expect(createHashMock).toBeCalledWith('sha256');
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        error:
          'Engineer validation failed: password: Path `password` (`sush`) is shorter than the minimum allowed length (8).'
      });

      createHashMock.mockRestore();

      done();
    } catch (error) {
      done(error);
    }
  });

  test('3.engineer tries to update another field using this endpoint which is not allowed', async done => {
    try {
      const response = await request(app)
        .patch(`/api/engineer/reset/${engnr.resetPasswordToken}`)
        .send({
          username: 'sush'
        });

      expect(response.statusCode).toBe(400);
      // expect(response.body).toMatchObject({
      //   error:
      //     'Engineer validation failed: password: Path `password` (`sush`) is shorter than the minimum allowed length (8).'
      // });

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER CREATES HIS PROFILE', () => {
  beforeAll(async () => {
    engnr = await Engineer.findOne({
      email: engineerOne.email
    });
  });

  test('1.engineer creates his profile', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/profile')
        .set('Authorization', `Bearer ${engnr.tokens[1]}`)
        .field('username', 'sushmit')
        .field('phone', '9869220334')
        .field('location[0]', 'mumbai')
        .field('licence[0]', 'civil')
        .field('bankName', 'icici')
        .field('accountNumber', '122344')
        .field('ABA', '12444')
        .attach('avatar', 'tests/fixtures/profile-pic.jpg');

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        message: 'profile has been created'
      });

      done();
    } catch (error) {
      done(error);
    }
  });

  test('2.another engineer tries to create a profile with same details but cannot  ', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/profile')
        .set('Authorization', `Bearer ${engnr.tokens[1]}`)
        .field('username', 'sushmit')
        .field('phone', '9869220334')
        .field('location[0]', 'mumbai')
        .field('licence[0]', 'civil')
        .field('bankName', 'icici')
        .field('accountNumber', '122344')
        .field('ABA', '12444')
        .attach('avatar', 'tests/fixtures/profile-pic.jpg');

      expect(response.statusCode).toBe(400);

      done();
    } catch (error) {
      done(error);
    }
  });

  test('3.engineer tries to create an invalid file format for the profile picture  ', async done => {
    try {
      const response = await request(app)
        .post('/api/engineer/profile')
        .set('Authorization', `Bearer ${engnr.tokens[1]}`)
        .field('username', 'sushmit')
        .field('phone', '9869220334')
        .field('location[0]', 'mumbai')
        .field('licence[0]', 'civil')
        .field('bankName', 'icici')
        .field('accountNumber', '122344')
        .field('ABA', '12444')
        .attach('avatar', 'tests/fixtures/sample-pdf-file.pdf');

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe(
        'Please upload either a png or jpg file'
      );

      done();
    } catch (error) {
      done(error);
    }
  });

  test('4.engineer views his profile', async done => {
    try {
      const response = await request(app)
        .get('/api/engineer/profile/view')
        .set('Authorization', `Bearer ${engnr.tokens[1]}`);

      expect(response.statusCode).toBe(200);

      done();
    } catch (error) {
      done(error);
    }
  });

  test('5.engineer has not created a profile but tries to view it', async done => {
    try {
      await new Engineer(engineerTwo).save();

      const response = await request(app)
        .get('/api/engineer/profile/view')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`);

      expect(response.statusCode).toBe(400);

      done();
    } catch (error) {
      done(error);
    }
  });

  test('6.engineer updates his profile', async done => {
    try {
      const response = await request(app)
        .patch('/api/engineer/profile/update')
        .set('Authorization', `Bearer ${engnr.tokens[1]}`)
        .send({
          username: 'shiven',
          bankName: 'SBI'
        });

      expect(response.statusCode).toBe(202);

      done();
    } catch (error) {
      done(error);
    }
  });

  test('7.engineer tries to update his profile but he hasnt created one', async done => {
    try {
      const response = await request(app)
        .patch('/api/engineer/profile/update')
        .set('Authorization', `Bearer ${engineerTwo.tokens[0]}`)
        .send({
          username: 'shiven',
          bankName: 'SBI'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('could not find details');

      done();
    } catch (error) {
      done(error);
    }
  });
});

describe('ENGINEER LOGGING OUT', () => {
  test('1.logging out an engineer', async done => {
    try {
      engnr = await Engineer.findOne({
        email: engineerOne.email
      });
      const response = await request(app)
        .post('/api/engineer/logout')
        .set('Authorization', `Bearer ${engnr.tokens[1]}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        message: 'logged out of all devices'
      });

      done();
    } catch (error) {
      done(error);
    }
  });
});
