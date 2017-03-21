module.exports = {

  siteconfig : {
                maintenanceMode : false,
                encr_key : '123456abcdef123'
                },
  mongo      : {
                host     : "localhost",
                port     : 27017,
                dbname   : "todoapp",
                username : "",
                password : "",
                NODE_ENV : ""         //  production   , local , test
              },

  mysql      : {
                host     : "localhost",
                port     : "",
                dbname   : "todoapp",
                username : "",
                password : ""
              }

};