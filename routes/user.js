var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var Post = mongoose.model('Post');
var Comment = mongoose.model('BlogComments');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* get single user details */
router.get('/user/:user', function(req, res, next){
    User.findById(req.params.user, function(err, user){
        if (err){
            return next(err);
        }
        currUser = {
            _id: user._id,
            role: user.role,
            lastname: user.lastname,
            firstname: user.firstname,
            username: user.username,
            points: user.points,
            rating: user.rating,
            mailid: user.mailid
        };
        res.json(currUser);
    });
});

module.exports = router;