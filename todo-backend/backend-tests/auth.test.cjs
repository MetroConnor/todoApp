const request = require('supertest');
const { expect } = require('chai');
const { app, pool } = require('../index.js');

describe('Auth Endpoints', () => {
    let token;
    let todoId;

    it('should login an existing user', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('token');
        token = res.body.token;
    });

    it('should create a new todo', async () => {
        const res = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Test TODO' });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id');
        expect(res.body.text).to.equal('Test TODO');
        todoId = res.body.id;
    });

    it('should fetch user todos', async () => {
        const res = await request(app)
            .get('/todos')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.be.greaterThan(0);
    });

    it('should update a todo', async () => {
        const res = await request(app)
            .put(`/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Updated TODO', completed: true });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id');
        expect(res.body.text).to.equal('Updated TODO');
        expect(res.body.completed).to.be.true;
    });

    it('should delete a todo', async () => {
        const res = await request(app)
            .delete(`/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('Todo deleted');
    });
});