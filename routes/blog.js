var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var Post = mongoose.model('Post');
var Comment = mongoose.model('BlogComments');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* PARAM for post */
router.param('post', function(req, res, next, id){
	var query = Post.findById(id);
	query.exec(function(err, post){
		if (err){
			return next(err);
		}
		if (!post){
			return next(new Error('can\'t find post'));
		}
		req.post = post;
		return next();
	});
});

/* PARAM for comments */
router.param('comment', function(req, res, next, id){
	var query = Comment.findById(id);
	query.exec(function(err, comment){
		if (err){
			return next(err);
		}
		if (!comment){
			return next(new Error('can\'t find comment'));
		}
		req.comment = comment;
		return next();
	});
});

/* return all blog posts */
router.get('/posts', function(req, res, next){
	Post.find(function(err, posts){
		if (err){
			return next(err);
		}
		res.json(posts)
	});
});

/* submit a new blog post */
router.post('/posts', auth, function(req, res, next){
	var blogPost = new Post(req.body);
	blogPost.createdBy = req.payload.username;
	blogPost.save(function(err, post){
		if (err){
			return next(err);
		}
		res.json(post);
	});
});

/* return a specific post */
router.get('/posts/:post', function(req, res){
	req.post.populate('comments', function(err, post){
		if (err){
			return next(err);
		}
		res.json(post);
	});
});

/* upvote a post */
router.put('/posts/:post/upvote', auth, function(req, res, next){
	req.post.upVote(req.payload.username, function(err, post){
		if (err){
			return next(err);
		}
		res.json(post);
	});
});

/* downvote a post */
router.put('/posts/:post/downvote', auth, function(req, res, next){
	req.post.downVote(req.payload.username, function(err, post){
		if (err){
			return next(err);
		}
		res.json(post);
	});
});

/* add comment to a post */
router.post('/posts/:post/comments', auth, function(req, res, next){
	var comment = new Comment(req.body);
	comment.post = req.post;
	comment.createdBy = req.payload.username;
    console.log(req.body);
	comment.save(function(err, comment){
		if (err){
			return next(err);
		}
		req.post.comments.push(comment);
		req.post.save(function(err, post){
			if (err){
				return next(err);
			}
			res.json(comment);
		});
	});
});

/* upvote a comment */
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next){
	req.comment.upVote(function(err, comment){
		if (err){
			return next(err);
		}
		res.json(comment);
	});
});

/* downvote a comment */
router.put('/posts/:post/comments/:comment/downvote', auth, function(req, res, next){
	req.comment.downVote(function(err, comment){
		if (err){
			return next(err);
		}
		res.json(comment);
	});
});

module.exports = router;