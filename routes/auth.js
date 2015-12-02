var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var Post = mongoose.model('Post');
var Comment = mongoose.model('BlogComments');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* register a new user */
router.post('/register', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all required fields'});
	}
	var user = new User();
	user.username = req.body.username;
	user.setPassword(req.body.password);
	user.firstname = req.body.firstname;
	user.lastname = req.body.lastname;
    user.mailid = req.body.mailid;
    user.role = req.body.role;
	user.save(function(err){
		if (err){
			return next(err);
		}
		return res.json({token: user.generateJWT()});
	});
});

/* log user in */
router.post('/login', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please enter username and password'});
	}
	passport.authenticate('local', function(err, user, info){
		if (err){
			return next(err);
		}
		if (user){
            return res.json({token: user.generateJWT()});
		}
		else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

module.exports = router;