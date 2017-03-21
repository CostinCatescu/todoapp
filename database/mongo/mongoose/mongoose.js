var mongoose = require('mongoose');
var mongocnf = require('../../../config').mongo;
var env = mongocnf.NODE_ENV  || process.env.NODE_ENV;

mongoose.Promise = global.Promise;

switch (env){

    case "production" :

        mongoose.connect( 'mongodb://costin:parola@ds135820.mlab.com:35820/todoapp');
        break;

    case "test":

        mongoose.connect( `mongodb://${mongocnf.host}:${mongocnf.port}/${mongocnf.dbname}Test`);
        break;

    // default is not specified =>  local

    default :
        mongoose.connect( `mongodb://${mongocnf.host}:${mongocnf.port}/${mongocnf.dbname}`);
}

module.exports = {mongoose};