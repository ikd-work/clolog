
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// MongoDB
var mongoModel = require('./models/log');
var db = mongoModel.createConnection('mongodb://localhost/log');

var Log = db.model('Log');
// Save Data
//var log = new Log();
//log.time  = '2012/05/26 11:11';
//log.source = '172.1.1.1';
//log.url = '/top';
//log.response_code = 404;

// user = new User({ name: 'KrdLab', point: 777 }); も可能

//log.save(function(err) {
//  if (err) { console.log(err); }
//});


// Routes

//app.get('/', routes.index);
app.get('/', function(req,res){
  Log.find().desc('time').find(function(err, logList) {
    res.render('index', {
      locals:{
        logs: logList
      }
    });
  });	
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
