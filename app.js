
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'clologsessionsecrte'}));
  app.use(passport.initialize());
  app.use(passport.session());
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

// Facebook OAuth
passport.use(new FacebookStrategy({
  clientID: "368494553205387",
  clientSecret: "89e22ea3b8589e7e0087959c369ab963",
  callbackURL: "http://172.19.65.129:3000/"
  },
  function(accessToken, refreshToken, profile, done){
    passport.session.accessToken = accessToken;
    process.nextTick(function(){
    done(null ,profile);
  });
}));

passport.serializeUser(function(user, done){
  done(null, user);
});
 
passport.deserializeUser(function(obj, done){
  done(null, obj);
});

// Routes

//app.get('/', routes.index);
app.get('/', function(req,res){
  passport.authenticate('facebook',{faulureRedirect: '/fail'});
  Log.find({},[],{limit:100}).desc('time').find(function(err, logList) {
    res.render('index', {
      locals:{
        logs: logList
      }
    });
  });	
});

app.get('/auth', passport.authenticate('facebook'));

app.get('/account', function(req,res){
  var https = require('https')
  , session = require('passport').session;
  api_path = '/me?access_token='+session.accessToken;
  var data = "";
  var my_info;
  var api_req = https.request({host: 'graph.facebook.com',path: api_path, method: 'GET'}, function(api_res){
    api_res.setEncoding('utf8');
    api_res.on('data',function(d){
      data += d;
    });
    api_res.on('end',function(){
      my_info = JSON.parse(data);
      res.render('account',{locals:{myname: data.name}});
    });
  });
});

app.get('/logout', function(req,res){
  req.session.destroy();
  req.logout();
  res.render('logout');
});

app.get('/search', function(req,res){
  var element = "";
  var keyword = "";
  if ( req.query.element ){
    element = req.query.element;
  }
  if ( req.query.keyword ){
    keyword = req.query.keyword;
    element = keyword.slice(keyword.indexOf("[")+1,keyword.indexOf("]"));
    keyword = keyword.slice(keyword.indexOf("]")+1);
  }
  var exp = new RegExp(keyword,"i");
  var keyobj = new Object();
  keyobj[element] = exp;
  Log.find(keyobj,[],{limit:100}).desc('time').find(function(err,logList) {
    res.render('index', {
      locals:{
        logs:logList,
        keyword:keyword
      }
    });
  });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
