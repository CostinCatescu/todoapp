const expect = require('expect');

const request = require('supertest');
const {app, Todo} = require('../app');
const {ObjectID} = require('mongodb');

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo'
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

// create todos

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

// get test
describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
       request(app)
           .get(`/todos/${new ObjectID().toHexString()}`)
           .expect(404)
           .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app).
        get('/todos/123')
            .expect(404).end(done);
    });
});

// delete test
describe('DELETE / todos/:id ', ()=>{

    it('should delete an todo ', (done)=>{

        request(app)
            .delete(`/todos/${new ObjectID(todos[0]._id).toHexString()}`)
            .expect(200)
            .end(done);
    });

    it('should return 404 if todo not found', (done)=>{
        request(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if invalid key is provided', (done)=>{
        request(app)
            .delete(`/todos/123456`)
            .expect(404)
            .end(done);
    });
});

describe("PATCH todos/:id", ()=>{
    it('Should modify first todo and set completedAt to be number, and completted to be true ',(done)=>{
       var id = todos[0]._id.toHexString();
       var text = "Some random text";

        request(app)
            .patch(`/todos/${id}`)
            .send({ text, completed : true })
            .expect(200)
            .expect((res)=>{
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeA('number');
            }).end(done);
    });
    it('Should modify first todo and set completedAt to null ',(done)=>{

        var id = todos[1]._id.toHexString();
        var text = "Some another random text";

        request(app)
            .patch(`/todos/${id}`)
            .send({ text, completed : false })
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            }).end(done);

    });

    it('should return 404 if todo not found', (done)=>{
        var text = "Some another random text";
        request(app)
            .patch(`/todos/${new ObjectID().toHexString()}`)
            .send({ text, completed : true })
            .expect(404)
            .end(done);
    });

    it('should return 404 if invalid key is provided', (done)=>{
        var text = "Some another random text";
        request(app)
            .patch(`/todos/123456`)
            .send({ text, completed : true })
            .expect(404)
            .end(done);
    });

});