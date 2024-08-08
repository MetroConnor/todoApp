const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { app, pool } = require('../index.js');

const JWT_SECRET = 't&5*P$5QwA!R%8e@U6sY';

describe('API Endpoints', () => {
    describe('POST /register', () => {
        it('should register a new user', async () => {
            const fakeUser = {username: 'testuser', password: 'password', role: 'user'};

            const queryStub = sinon.stub(pool, 'query').resolves({rows: [{id: 1, username: 'testuser', role: 'user'}]});

            const res = await request(app)
                .post('/register')
                .send(fakeUser);

            expect(res.status).to.equal(200);
            expect(res.body).to.include({id: 1, username: 'testuser', role: 'user'});

            queryStub.restore();
        });

        it('should return 500 if there is a database error', async () => {
            const fakeUser = {username: 'testuser', password: 'password', role: 'user'};

            const queryStub = sinon.stub(pool, 'query').rejects(new Error('Database error'));

            const res = await request(app)
                .post('/register')
                .send(fakeUser);

            expect(res.status).to.equal(500);
            expect(res.body).to.have.property('error', 'Internal Server Error');

            queryStub.restore();
        });
    });

    describe('POST /login', () => {
        it('should authenticate a user and return a JWT token', async () => {
            const fakeUser = {username: 'testuser', password: 'testpassword'};
            const hashedPassword = await bcrypt.hash(fakeUser.password, 10);

            const queryStub = sinon.stub(pool, 'query').resolves({
                rows: [{
                    id: 1,
                    username: 'testuser',
                    password: hashedPassword,
                    role: 'user'
                }]
            });

            const res = await request(app)
                .post('/login')
                .send(fakeUser);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token');

            queryStub.restore();
        });

        it('should return 401 for invalid credentials', async () => {
            const fakeUser = {username: 'testuser', password: 'wrongpassword'};

            const queryStub = sinon.stub(pool, 'query').resolves({
                rows: [{
                    id: 1,
                    username: 'testuser',
                    password: 'hashedpassword',
                    role: 'user'
                }]
            });

            const res = await request(app)
                .post('/login')
                .send(fakeUser);

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'Invalid username or password');

            queryStub.restore();
        });

        it('should return 500 if there is a database error', async () => {
            const fakeUser = {username: 'testuser', password: 'testpassword'};

            const queryStub = sinon.stub(pool, 'query').rejects(new Error('Database error'));

            const res = await request(app)
                .post('/login')
                .send(fakeUser);

            expect(res.status).to.equal(500);
            expect(res.body).to.have.property('error', 'Internal Server Error');

            queryStub.restore();
        });
    });

    describe('GET /todos', () => {
        it('should return todos for admin', async () => {
            const token = jwt.sign({id: 1, role: 'admin'}, JWT_SECRET, {expiresIn: '1h'});

            const queryStub = sinon.stub(pool, 'query').resolves({
                rows: [{id: 1, text: 'Sample Todo', completed: false, user_id: 1, username: 'testuser'}]
            });

            const res = await request(app)
                .get('/todos')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array').that.is.not.empty;

            queryStub.restore();
        });

        it('should return todos for a regular user', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});

            const queryStub = sinon.stub(pool, 'query').resolves({
                rows: [{id: 1, text: 'Sample Todo', completed: false, user_id: 1, username: 'testuser'}]
            });

            const res = await request(app)
                .get('/todos')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array').that.is.not.empty;

            queryStub.restore();
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/todos');

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'No token provided');
        });

        it('should return 500 if there is a database error', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});

            const queryStub = sinon.stub(pool, 'query').rejects(new Error('Database error'));

            const res = await request(app)
                .get('/todos')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(500);
            expect(res.body).to.have.property('error', 'Internal Server Error');

            queryStub.restore();
        });
    });

    describe('POST /todos', () => {
        it('should create a new todo', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});
            const newTodo = {text: 'New Todo'};

            const queryStub = sinon.stub(pool, 'query').onFirstCall().resolves({
                rows: [{
                    id: 1,
                    text: 'New Todo',
                    completed: false,
                    user_id: 1
                }]
            })
                .onSecondCall().resolves({rows: [{username: 'testuser'}]});

            const res = await request(app)
                .post('/todos')
                .set('Authorization', `Bearer ${token}`)
                .send(newTodo);

            expect(res.status).to.equal(200);
            expect(res.body).to.include({text: 'New Todo', completed: false});

            queryStub.restore();
        });

        it('should return 400 if text is missing', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});

            const res = await request(app)
                .post('/todos')
                .set('Authorization', `Bearer ${token}`)
                .send({}); // No text provided

            expect(res.status).to.equal(400);
            expect(res.text).to.equal('Text und userId sind erforderlich');
        });

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).post('/todos').send({text: 'New Todo'});

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'No token provided');
        });

        it('should return 500 if there is a database error', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});

            const queryStub = sinon.stub(pool, 'query').rejects(new Error('Database error'));

            const res = await request(app)
                .post('/todos')
                .set('Authorization', `Bearer ${token}`)
                .send({text: 'New Todo'});

            expect(res.status).to.equal(500);
            expect(res.body).to.have.property('error', 'Error creating todo');

            queryStub.restore();
        });
    });

    describe('PUT /todos/:id', () => {
        it('should update a todo', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});
            const todoUpdate = {text: 'Updated Todo', completed: true};

            const queryStub = sinon.stub(pool, 'query')
                .onFirstCall().resolves({rows: [{id: 1, text: 'Old Todo', user_id: 1}]})
                .onSecondCall().resolves({rows: [{id: 1, text: 'Updated Todo', completed: true, user_id: 1}]})
                .onThirdCall().resolves({rows: [{username: 'testuser'}]})

            const res = await request(app)
                .put('/todos/1')
                .set('Authorization', `Bearer ${token}`)
                .send(todoUpdate);

            expect(res.status).to.equal(200);
            expect(res.body).to.include({text: 'Updated Todo', completed: true});

            queryStub.restore();
        });

        it('should return 403 if user is not authorized to update the todo', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});

            const queryStub = sinon.stub(pool, 'query')
                .onFirstCall().resolves({rows: [{id: 1, text: 'Old Todo', user_id: 2}]});

            const res = await request(app)
                .put('/todos/1')
                .set('Authorization', `Bearer ${token}`)
                .send({text: 'Updated Todo', completed: true});

            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('error', 'Unauthorized');

            queryStub.restore();
        });

        it('should return 404 if todo is not found', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});

            const queryStub = sinon.stub(pool, 'query').resolves({rows: []});

            const res = await request(app)
                .put('/todos/999')
                .set('Authorization', `Bearer ${token}`)
                .send({text: 'Updated Todo', completed: true});

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'Todo not found');

            queryStub.restore();
        });

        it('should return 500 if there is a database error', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});

            const queryStub = sinon.stub(pool, 'query').rejects(new Error('Database error'));

            const res = await request(app)
                .put('/todos/1')
                .set('Authorization', `Bearer ${token}`)
                .send({text: 'Updated Todo', completed: true});

            expect(res.status).to.equal(500);
            expect(res.body).to.have.property('error', 'Internal Server Error');

            queryStub.restore();
        });
    });

    describe('DELETE /todos/:id', () => {
        it('should delete a todo', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});

            const queryStub = sinon.stub(pool, 'query')
                .onFirstCall().resolves({rows: [{id: 1, user_id: 1}]})
                .onSecondCall().resolves();

            const res = await request(app)
                .delete('/todos/1')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message', 'Todo deleted');

            queryStub.restore();
        });

        it('should return 403 if user is not authorized to delete the todo', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});

            const queryStub = sinon.stub(pool, 'query')
                .onFirstCall().resolves({rows: [{id: 1, user_id: 2}]});

            const res = await request(app)
                .delete('/todos/1')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('error', 'Unauthorized');

            queryStub.restore();
        });

        it('should return 404 if todo is not found', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});

            const queryStub = sinon.stub(pool, 'query').resolves({rows: []});

            const res = await request(app)
                .delete('/todos/999')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'Todo not found');

            queryStub.restore();
        });

        it('should return 500 if there is a database error', async () => {
            const token = jwt.sign({id: 1, role: 'user'}, JWT_SECRET, {expiresIn: '1h'});

            const queryStub = sinon.stub(pool, 'query').rejects(new Error('Database error'));

            const res = await request(app)
                .delete('/todos/1')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(500);
            expect(res.body).to.have.property('error', 'Internal Server Error');

            queryStub.restore();
        });
    });
});