'use strict';

process.env.SECRET = 'TEST_SECRET';

const supertest = require('supertest');
const { app } = require('../server');
const { sequelizeDB } = require('../models');
const request = supertest(app);

beforeAll(async () => {
  await sequelizeDB.sync();
});

afterAll(async () => {
  await sequelizeDB.drop();
});

describe('Test API Server', () => {

  test('404 on invalid route', async () => {
    const response = await request.get('/definitelydoesnotexist');
    expect(response.status).toEqual(404);
  });

  test('404 on invalid route', async () => {
    const response = await request.get('/also/does/not/exist');
    expect(response.status).toEqual(404);
  });

  test('Test root route', async () => {
    const response = await request.get('/');
    expect(response.status).toEqual(200);
  });

  // test('500 if name not specified in /users POST', async () => {
  //   const response = await request.post('/api/v1/users').send({
  //     notName: 'Test User',
  //   });
  //   expect(response.status).toEqual(500);
  // });

});

describe('Test admin authentication', () => {
  const testUsername = 'testAdmin';
  const testPassword = 'adminpasswordSuperSecret!';
  const testRole = 'admin';

  test('Admin signup', async () => {
    const response = await request.post('/auth/signup').send({
      username: testUsername,
      password: testPassword,
      role: testRole,
    });
    const { username, role, capabilities, token } = response.body;

    expect(username).toEqual(testUsername);
    expect(role).toEqual(testRole);
    expect(capabilities).toContain('superuser');
    expect(token).toBeTruthy();
  });
  
  test('Valid admin signin', async () => {
    const encodedAuth = Buffer.from(`${testUsername}:${testPassword}`).toString('base64');
    
    const response = await request
      .post('/auth/signin')
      .set('Authorization', 'basic ' + encodedAuth);

    const { username, role, capabilities, token } = response.body;
    
    expect(username).toEqual(testUsername);
    expect(role).toEqual(testRole);
    expect(capabilities).toContain('superuser');
    expect(token).toBeTruthy();
  });

  test('Generic auth error when password is incorrect', async () => {
    const encodedAuth = Buffer.from(`${testUsername}:incorrectpassword!`).toString('base64');
    const response = await request
      .post('/auth/signin')
      .set('Authorization', 'basic ' + encodedAuth);

    expect(response.status).toEqual(401);
  });

  test('Generic auth error when username does not exist', async () => {
    const encodedAuth = Buffer.from(`Definitelynotarealusername:dontevenbotherwithapassword!`).toString('base64');
    const response = await request
      .post('/auth/signin')
      .set('Authorization', 'basic ' + encodedAuth);

    expect(response.status).toEqual(401);
  });
});

describe('Test user authentication', () => {
  const testUsername = 'testUser';
  const testPassword = 'thisisapassworditprobablyisnotverygood';
  const testRole = 'reader';

  test('User signup', async () => {
    const response = await request.post('/auth/signup').send({
      username: testUsername,
      password: testPassword,
      role: testRole,
    });

    const { username, role, capabilities, token } = response.body;

    expect(username).toEqual(testUsername);
    expect(role).toEqual(testRole);
    expect(capabilities).toContain('checkout');
    expect(capabilities).not.toContain('superuser');
    expect(token).toBeTruthy();
  });

  test('Valid user signin', async () => {
    const encodedAuth = Buffer.from(`${testUsername}:${testPassword}`).toString('base64');
    
    const signInResponse = await request
      .post('/auth/signin')
      .set('Authorization', 'basic ' + encodedAuth);

    const { username, role, capabilities, token } = signInResponse.body;

    expect(username).toEqual(testUsername);
    expect(role).toEqual(testRole);
    expect(capabilities).toContain('checkout');
    expect(capabilities).not.toContain('superuser');
    expect(token).toBeTruthy();
  });
});

describe('Test /books endpoint methods with valid authentication', () => {
  const testUsername = 'testAdmin';
  const testPassword = 'adminpasswordSuperSecret!';
  
  let token = '';
  beforeAll(async () => {
    const encodedAuth = Buffer.from(`${testUsername}:${testPassword}`).toString('base64');
    
    const response = await request
      .post('/auth/signin')
      .set('Authorization', 'basic ' + encodedAuth);
      
    token = response.body.token;
  });

  test('Handle getting all books', async () => {
    const response = await request
      .get('/api/v2/books')
      .set('Authorization', 'bearer ' + token);
    expect(response.status).toEqual(200);
  });

  test('Create a book', async () => {
    let response = await request
      .post('/api/v2/books')
      .set('Authorization', 'bearer ' + token)
      .send({
        title: 'Test Book',
        author: 'Test Author',
        pages: 100,
      });
    expect(response.status).toEqual(201);
    expect(response.body.title).toEqual('Test Book');
    expect(response.body.author).toEqual('Test Author');
    expect(response.body.pages).toEqual(100);
  });

  test('Get a book by id', async () => {
    const response = await request
      .get('/api/v2/books/1')
      .set('Authorization', 'bearer ' + token);
    expect(response.status).toEqual(200);
    expect(response.body.title).toEqual('Test Book');
    expect(response.body.author).toEqual('Test Author');
    expect(response.body.pages).toEqual(100);
  });

  test('Update a book', async () => {
    let response = await request
      .put('/api/v2/books/1')
      .set('Authorization', 'bearer ' + token)
      .send({
        title: 'Updated Test Book',
      });
    expect(response.status).toEqual(200);
    expect(response.body.title).toEqual('Updated Test Book');
    expect(response.body.author).toEqual('Test Author');
    expect(response.body.pages).toEqual(100);
  });

  test('Delete a book', async () => {
    let response = await request
      .delete('/api/v2/books/1')
      .set('Authorization', 'bearer ' + token);
    expect(response.status).toEqual(200);
    expect(response.body.title).toBeUndefined();
  });
});

describe('Test /books endpoint methods with invalid authentication', () => {
  test('Handle getting all books', async () => {
    const response = await request
      .get('/api/v2/books');
    expect(response.status).toEqual(401);
  });

  test('Create a book', async () => {
    let response = await request
      .post('/api/v2/books')
      .send({
        title: 'Test Book',
        author: 'Test Author',
        pages: 100,
      });
    expect(response.status).toEqual(401);
  });

  test('Get a book by id', async () => {
    const response = await request
      .get('/api/v2/books/1');
    expect(response.status).toEqual(401);
  });

  test('Update a book', async () => {
    let response = await request
      .put('/api/v2/books/1')
      .send({
        title: 'Updated Test Book',
      });
    expect(response.status).toEqual(401);
  });

  test('Delete a book', async () => {
    let response = await request
      .delete('/api/v2/books/1');
    expect(response.status).toEqual(401);
  });
});