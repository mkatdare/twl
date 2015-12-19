var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var Site = mongoose.model('Site');
var Review = mongoose.model('SiteReview');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* PARAM for site */
router.param('site', function(req, res, next, id){
	var query = Site.findById(id);
	query.exec(function(err, site){
		if (err){
			return next(err);
		}
		if (!site){
			return next(new Error('can\'t find site'));
		}
		req.site = site;
		return next();
	});
});

/* PARAM for reviews */
router.param('review', function(req, res, next, id){
	var query = Review.findById(id);
	query.exec(function(err, review){
		if (err){
			return next(err);
		}
		if (!review){
			return next(new Error('can\'t find review'));
		}
		req.review = review;
		return next();
	});
});

/* return all sites */
router.get('/sites', function(req, res, next){
	Site.find(function(err, sites){
		if (err){
			return next(err);
		}
		res.json(sites)
	});
});

/* submit a new blog site */
router.post('/sites', auth, function(req, res, next){
	var newSite = new Site(req.body);
	newSite.createdBy = req.payload.username;
	newSite.save(function(err, site){
		if (err){
			return next(err);
		}
		res.json(site);
	});
});

/* return a specific site */
router.get('/sites/:site', function(req, res){
	req.site.populate('reviews', function(err, site){
		if (err){
			return next(err);
		}
		res.json(site);
	});
});

/* upvote a site */
router.put('/sites/:site/upvote', auth, function(req, res, next){
	req.site.upVote(req.payload.username, function(err, site){
		if (err){
			return next(err);
		}
		res.json(site);
	});
});

/* downvote a site */
router.put('/sites/:site/downvote', auth, function(req, res, next){
	req.site.downVote(req.payload.username, function(err, site){
		if (err){
			return next(err);
		}
		res.json(site);
	});
});

/* add review to a site */
router.post('/sites/:site/reviews', auth, function(req, res, next){
	var review = new Review(req.body);
	review.site = req.site;
	review.createdBy = req.payload.username;
    review.save(function(err, review){
		if (err){
			return next(err);
		}
		req.site.reviews.push(review);
		req.site.save(function(err, site){
			if (err){
				return next(err);
			}
			res.json(review);
		});
	});
});

/* upvote a review */
router.put('/sites/:site/reviews/:review/upvote', auth, function(req, res, next){
	req.review.upVote(function(err, review){
		if (err){
			return next(err);
		}
		res.json(review);
	});
});

/* downvote a review */
router.put('/sites/:site/reviews/:review/downvote', auth, function(req, res, next){
	req.review.downVote(function(err, review){
		if (err){
			return next(err);
		}
		res.json(review);
	});
});

module.exports = router;