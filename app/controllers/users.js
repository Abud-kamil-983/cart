var express = require('express');
var userRouter = express.Router();
var mongoose = require('mongoose');
var userModel = mongoose.model('User');
var responseGenerator = require('./../../libs/response.js');
var auth = require('./../../middlewares/auth.js');
var crypto = require('crypto');
var nodemailer = require("nodemailer");


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
				req.flash('success', 'successfully Logged In.');
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

	userRouter.post('/forgot-password', function(req, res){
		var token = crypto.randomBytes(20).toString('hex');
		userModel.findOne({ email: req.body.email }, function(err, user) {
			console.log(user);
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          res.redirect('users/forgot-password');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
         if (err) {
				res.render('error.hbs', {error:err}); 
			}
			else{
				var smtpTransport = nodemailer.createTransport({
					service: "gmail",
					host: "smtp.gmail.com",
					auth: {
					user: "md.abud.kamil@gmail.com",
					pass: "toshisabri"
					}
				});

				var mailOptions = {
					to: 'kamilthecyclone@gmail.com',
					from: 'md.abud.kamil@gmail.com',
					subject: 'Password Reset',
					text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					if (err) {
						res.render('error.hbs', {error:err});
					}
					else{
						req.flash('success', 'mail sent to your email id,please click on the link.');
						res.redirect('/users/forgot-password');
					}
				});

			}
        });
      });

	});

	userRouter.get('/reset/:token', function(req, res) {
	  userModel.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
	    if (!user) {
	      req.flash('error', 'Password reset token is invalid or has expired.');
	      res.redirect('users/forgot');
	    }
	    res.render('reset.hbs');
	  });
	});

	userRouter.post('/reset/:token', function(req, res){
		userModel.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
	        if (!user) {
	          req.flash('error', 'Password reset token is invalid or has expired.');
	          res.redirect('back');
	        }

	        user.password = req.body.password;
	        user.resetPasswordToken = undefined;
	        user.resetPasswordExpires = undefined;
	        user.save(function(err) {
	          if (err) {
	          	res.render('error.hbs', {error:err});
	          }
	          else{
	          	req.flash('success', 'Password changed successfully, Please login with new password');
	          	res.redirect('/users/login/screen');
	          }

	        });
	    });    
	});

	app.use('/users', userRouter);
	
}