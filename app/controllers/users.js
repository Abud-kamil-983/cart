var express = require('express');
var userRouter = express.Router();
var mongoose = require('mongoose');
var userModel = mongoose.model('User');
var responseGenerator = require('./../../libs/response.js');
var auth = require('./../../middlewares/auth.js');


module.exports.controller = function(app){

	userRouter.get('/create', function(req, res){
		res.render('register.hbs');

	});

	userRouter.post('/save', function(req, res){
		var newUser = new userModel();
		newUser.userName = req.body.firstName+req.body.lastName+req.body.mobile;
		newUser.firstName = req.body.firstName;
		newUser.lastName = req.body.lastName;
		newUser.email = req.body.email;
		var today = Date.now();
		newUser.createdAt = today;
		newUser.mobile = req.body.mobile;
		newUser.password = req.body.password; 
		newUser.save(function(error){
			if (error) {
				res.render('error.hbs', {error:error}); 
			}
			else{
				req.session.user = newUser;
				delete req.session.user.password;
				res.redirect('/users/dashboard') 
			}
		});	

	});

	userRouter.get('/login/screen', function(req, res){
		res.render('login.hbs');
	});

	userRouter.post('/login', function(req, res){
		userModel.findOne({$and:[{'email':req.body.email}, {'password':req.body.password}]}, function(err, userData){
			if (err) {
				res.render('error.hbs',{error:err});
			}
			else if (userData === null || userData === undefined || userData.userName === undefined) {
				var myresponse = responseGenerator.response(true, "user not found", 500, null);
				res.render('error.hbs', {error:myresponse.message});
			}
			else{
				req.session.user = userData;
				res.redirect('/users/dashboard');
			}
		});
	});

	userRouter.get('/dashboard', auth.checkLogin, function(req, res){
		res.render('dashboard.hbs', {user:req.session.user});
	});

	userRouter.get('/logout', function(req, res){
		req.session.destroy(function(err){
			res.redirect('/users/login/screen');
		})
	});

	userRouter.get('/forgot-password', function(req, res){
		res.render('forgot-password.hbs');
	});

	app.use('/users', userRouter);
	
}







