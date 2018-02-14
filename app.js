var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies
var mongoose = require('mongoose');
var path = require('path');
var hbs = require('hbs');
var session = require('express-session');
app.use(session({
  secret: 'mysecretapp',
  resave: false,
  httpOnly: true,
  saveUninitialized: true,
  cookie: { secure: false }
}))
// requiring mongoose objectId
var ObjectId = require('mongodb').ObjectId; 
var dbpath = 'mongodb://localhost/CartApp';

db = mongoose.connect(dbpath);

mongoose.connection.once('open', function(){
	console.log('database connection opened');
});

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/app/views'));

var fs = require('fs');
fs.readdirSync('./app/models').forEach(function(file){
	if (file.indexOf('.js')) {
		require('./app/models/'+file);
	}
});

fs.readdirSync('./app/controllers').forEach(function(file){
	if (file.indexOf('.js')) {
		var route = require('./app/controllers/'+file);
		route.controller(app);
	}
});

var auth = require('./middlewares/auth.js');
app.use(auth.setLogggedInUser);

app.listen(3000, function(){
 	console.log('Example app listening on port 3000!')
 });