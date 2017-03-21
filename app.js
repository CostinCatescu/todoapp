const express = require('express');
var bodyParser = require('body-parser');
var app = express();
const PORT = process.env.PORT || 3000;
const IP = process.env.IP || "127.0.0.1";
const _ = require('lodash');
var path = require('path');
var config = require('./config').siteconfig;

var {mongoose, models} = require('./database').mongo;
var {Todo, User} = models;
const {ObjectID} = require('mongodb');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var {auth} = require('./middleware/authenticate');

io.on('connect', (client)=>{

    console.log('client connected');

});

app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');

app.use('/', (req, res, next)=>{
    if(config.maintenanceMode){
        res.status(503).send('site in maintenance mode ');
    }
    else
        {
            next();
        }
});

app.get('/', (req, res)=>{

   res.render('index');

});


app.get('/users/me', auth, (req, res)=>{

res.send(res.user);

});

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', (req, res)=>{
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });

});

app.patch('/todos/:id', (req, res)=>{
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    var body = _.pick( req.body, ['text', 'completed']);
    if( _.isBoolean(body.completed) && body.completed )
    {
        body.completedAt = new Date().getTime();
    }else {
        body.completedAt = null;
        body.completed = false;
    }
    Todo.findByIdAndUpdate(id, { $set :body} , { new : true }).then((todo)=>{
        if(!todo){
            return res.status(404).send();
        }
        res.status(200).send({todo});

    }).catch((e)=>{
        res.status(400).send();
    });


});

app.post('/users', (req, res) => {
    var body = _.pick( req.body, ['email', 'password']);

        var user = new User(body);
        user.save().then(() => {
           return user.generateAuthToken();
            // res.send(user);
        })
            .then((token)=>{
            res.header('x-auth', token).send(user.toJSON());
            })
            .catch((e) => {
            res.status(400).send(e);
        });
});

server.listen(PORT, ()=>{
        console.log(`Server started at http://${IP}:${PORT}`);
});


module.exports =
    {app , Todo};