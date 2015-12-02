var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var Post = mongoose.model('Post');
var Comment = mongoose.model('BlogComments');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next){
  res.render('index', { title: 'Express' });
});

module.exports = router;
