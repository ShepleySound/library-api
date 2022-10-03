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
  const testUsername = 'testReader';
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
    
    const signinResponse = await request
      .post('/auth/signin')
      .set('Authorization', 'basic ' + encodedAuth);

    const { username, role, capabilities, token } = signinResponse.body;

    expect(username).toEqual(testUsername);
    expect(role).toEqual(testRole);
    expect(capabilities).toContain('checkout');
    expect(capabilities).not.toContain('superuser');
    expect(token).toBeTruthy();
  });
});

describe('Test basic /books CRUD methods with valid authentication', () => {
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
      .get('/api/books')
      .set('Authorization', 'bearer ' + token);
    expect(response.status).toEqual(200);
  });

  test('Create a book', async () => {
    let response = await request
      .post('/api/books')
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
      .get('/api/books/1')
      .set('Authorization', 'bearer ' + token);
    expect(response.status).toEqual(200);
    expect(response.body.title).toEqual('Test Book');
    expect(response.body.author).toEqual('Test Author');
    expect(response.body.pages).toEqual(100);
  });

  test('Update a book using PUT', async () => {
    let response = await request
      .put('/api/books/1')
      .set('Authorization', 'bearer ' + token)
      .send({
        title: 'Updated Test Book',
      });
    expect(response.status).toEqual(200);
    expect(response.body.title).toEqual('Updated Test Book');
    expect(response.body.author).toEqual('Test Author');
    expect(response.body.pages).toEqual(100);
  });

  test('Update a book using PATCH', async () => {
    let response = await request
      .patch('/api/books/1')
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
      .delete('/api/books/1')
      .set('Authorization', 'bearer ' + token);
    expect(response.status).toEqual(200);
    expect(response.body?.title).toBeUndefined();
  });

});

describe('Test basic /books CRUD methods with invalid authentication', () => {
  test('Handle getting all books', async () => {
    const response = await request
      .get('/api/books');
    expect(response.status).toEqual(401);
  });

  test('Create a book', async () => {
    let response = await request
      .post('/api/books')
      .send({
        title: 'Test Book',
        author: 'Test Author',
        pages: 100,
      });
    expect(response.status).toEqual(401);
  });

  test('Get a book by id', async () => {
    const response = await request
      .get('/api/books/1');
    expect(response.status).toEqual(401);
  });

  test('Update a book', async () => {
    let response = await request
      .put('/api/books/1')
      .send({
        title: 'Updated Test Book',
      });
    expect(response.status).toEqual(401);
  });

  test('Delete a book', async () => {
    let response = await request
      .delete('/api/books/1');
    expect(response.status).toEqual(401);
  });
});

describe('Test role-based access flow', () => {

  const testAdmin = 'testAdmin';
  const testAdminPassword = 'adminpasswordSuperSecret!';
  const testLibrarian = 'testLibrarian';
  const testLibrarianPassword = 'thisisapassworditisalright';
  const testReader = 'testReader';
  const testReaderPassword = 'thisisapassworditprobablyisnotverygood';

  let adminToken = '';
  let librarianToken = '';
  let readerToken = '';
  beforeAll(async () => {
    
    await request.post('/auth/signup').send({
      username: testLibrarian,
      password: testLibrarianPassword,
      role: 'librarian',
    });  

    const adminEncodedAuth = Buffer.from(`${testAdmin}:${testAdminPassword}`).toString('base64');

    const adminSigninResponse = await request
      .post('/auth/signin')
      .set('Authorization', 'basic ' + adminEncodedAuth);

    adminToken = adminSigninResponse.body.token;

    const librarianEncodedAuth = Buffer.from(`${testLibrarian}:${testLibrarianPassword}`).toString('base64');

    const librarianSigninResponse = await request
      .post('/auth/signin')
      .set('Authorization', 'basic ' + librarianEncodedAuth);

    librarianToken = librarianSigninResponse.body.token;
    
    const readerEncodedAuth = Buffer.from(`${testReader}:${testReaderPassword}`).toString('base64');
    
    const readerSigninResponse = await request
      .post('/auth/signin')
      .set('Authorization', 'basic ' + readerEncodedAuth);
    
    readerToken = readerSigninResponse.body.token;
  });

  test('All tokens should have values', () => {
    expect(adminToken).toBeTruthy();
    expect(librarianToken).toBeTruthy();
    expect(readerToken).toBeTruthy();
  });

  test('Create a book', async () => {
    const response = await request
      .post('/api/books')
      .set('Authorization', 'bearer ' + adminToken)
      .send({
        title: 'Test Book',
        author: 'Test Author',
        pages: 100,
      });
    expect(response.status).toEqual(201);
  });

  test('Admins can add books to the full catalog', async () => {
    const books = [
      {
        title: 'Test Book1',
        author: 'Test Author1',
        pages: 100,
      },
      {
        title: 'Test Book2',
        author: 'Test Author2',
        pages: 200,
      },
      {
        title: 'Test Book3',
        author: 'Test Author3',
        pages: 300,
      },
      {
        title: 'Test Book4',
        author: 'Test Author4',
        pages: 400,
      },
      {
        title: 'Test Book5',
        author: 'Test Author5',
        pages: 500,
      },
    ];
    for (const book of books) {
      let response = await request
        .post('/api/books')
        .set('Authorization', 'bearer ' + adminToken)
        .send(book);
      expect(response.status).toEqual(201);
      expect(response.body.title).toEqual(book.title);
      expect(response.body.author).toEqual(book.author);
      expect(response.body.pages).toEqual(book.pages);
    }
  });

  test('Get a book by id', async () => {
    // Use book id '2' since we added and deleted a book earlier
    const response = await request
      .get('/api/books/2')
      .set('Authorization', 'bearer ' + adminToken);
    expect(response.status).toEqual(200);
    expect(response.body.title).toEqual('Test Book');
    expect(response.body.author).toEqual('Test Author');
    expect(response.body.pages).toEqual(100);
  });

  test('Admins can add libraries', async () => {
    let response = await request
      .post('/api/libraries')
      .set('Authorization', 'bearer ' + adminToken)
      .send({
        name: 'Test Library',
        location: 'Test location',
      });
    expect(response.status).toEqual(201);
  });

  test('Librarians can add books from the catalog to a library', async () => {
    const response = await request
      .patch('/api/books/2/1')
      .set('Authorization', 'bearer ' + librarianToken);
    expect(response.status).toEqual(200);
    const getResponse = await request
      .get('/api/books/2')
      .set('Authorization', 'bearer ' + librarianToken);
    expect(getResponse.status).toEqual(200);
    expect(getResponse.body.title).toEqual('Test Book');
    expect(getResponse.body.libraryId).toEqual(1);

  });
});
