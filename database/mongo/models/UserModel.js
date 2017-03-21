const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _  = require('lodash');
var encr_key = require('../../../config').siteconfig.encr_key;

var UserSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        trim :true,
        minlength: 1,
        unique : true,
        validate :{
            validator : validator.isEmail,
            message : '{VALUE} is not a valid email!'
        }
    },
    password : {
        type :  String,
        required: true,
        trim : true,
        minlength: 6
    },
    tokens : [{
        access : {
            type : String,
            required : true
        },
        token : {
            type : String,
            required : true
        }
    }]

});

UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = "auth";
    var token = jwt.sign({ _id : user._id.toHexString() , access}, encr_key).toString();
    user.tokens.push({access, token});
    return user.save()
        .then(()=>{
            return token;
    });
};

UserSchema.methods.toJSON = function(){
    var user = this;
    var userObj = user.toObject();
    return _.pick(userObj, [ '_id' , 'email' ]);
};

UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;
    try {
        decoded = jwt.verify(token, encr_key);
        console.log(decoded);
    }
    catch(e){
        return Promise.reject();
    }

    return User.findOne({
        _id : decoded._id,
        'tokens.token' : token,
        'tokens.access' : decoded.access

    }).catch((e)=>{

    });
};

var User = mongoose.model('User', UserSchema);

module.exports = User;