var {User} = require('../database').mongo.models;

    var auth =  (req, res, next)=>{

        var token = req.header('x-auth');
        User.findByToken(token).then((user)=>{
            if(!user){
                return Promise.reject();
            }
            res.user = user;
            res.token = token;
            next();
        })
            .catch((e)=>{
                res.status(401).send();
            });
    };

module.exports = {auth};