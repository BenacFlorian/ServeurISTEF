var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
var server = require('./server');

require('events').EventEmitter.prototype._maxListeners = 100;

// promise for fillDatabase
global.Promise = require('bluebird');

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;
    
  // start the server if `$ node server.js`
  if (require.main === module){
    
    //app.start();
    
    // try to find if model change compare to database
    // if there are changes, auto-update database
    var ds = server.datasources.db;
    ds.isActual(function(actual) {
      if(!actual) ds.autoupdate(function(err) {
        if(err) {
          console.log("Erreur durant l'autoupdate du schema serveur");
          console.log(err);
          process.exit();
        }
        else {
          // Check if database is empty, if empty -> Fill Database
          var User = app.models.User;
          User.find()
              .then(function(data) {
                if(data.length === 0) {
                  console.log("Empty database detected ; filling in");
                  require('./fillDatabase.js')(app);
                } else {
                  console.log("Reusing existing database");
                }
	            console.log("Starting app server !!!");
	            app.start();
              })
              .catch(function(err) {
                console.log("Erreur durant la verification de la base de données");
                console.log(err);
                process.exit();
              });
        }
      });
    });   
  }
});

