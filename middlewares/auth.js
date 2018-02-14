var mongoose = require('mongoose');
var userModel = mongoose.model('User');

module.exports.setLogggedInUser = function(req, res, next){
	if (req.session && req.session.user) {
		userModel.findOne({'email':req.session.user.email}, function(err, user){
			if (user) {
				req.session.user = user;
				delete req.session.user.password;
				next();
			}
			else{

			}
		});
	}
}

module.exports.checkLogin = function(req,res,next){
	if (!req.session.user) {
		res.redirect('/users/login/screen');
	}
	else{
		next();
	}
}