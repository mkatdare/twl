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
	Site.find({status: 'Active'}, function(err, sites){
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
router.get('/sites/:site/:currentUser', function(req, res){
	var currUserReview;
	req.site.populate('reviews', function(err, site){
		if (err){
			return next(err);
		}
		if (!(req.params.currentUser === 'null')){
			Review.findOne({site: site.id, createdBy: req.params.currentUser}, function(err, review){
				if (!err){
					currUserReview = review;
					res.json({site: site, currUserReview: currUserReview});
				}
			});
		}
		else {
			res.json({site: site});
		}
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
	review.rating = req.body.newRating;
    review.save(function(err, review){
		if (err){
			return next(err);
		}
		req.site.reviews.push(review);
		var tempRating = (req.site.rating * (req.site.reviews.length-1) + req.body.newRating)/req.site.reviews.length;
		req.site.rating = tempRating;
		req.site.save(function(err, site){
			if (err){
				return next(err);
			}
			res.json({review: review, rating: req.site.rating});
		});
	});
});

/* update a review */
router.put('/sites/:site/reviews/:review/update', auth, function(req, res, next){
	var review = req.review;
	var site = req.site;
	var currRating = review.rating;
	review.body = req.body.body;
	review.title = req.body.title;
	review.rating = req.body.newRating;
	review.save(function(err, review){
		if (err){
			return next(err);
		}
		site.rating = ((site.rating*site.reviews.length) - currRating + req.body.newRating)/site.reviews.length;
		site.save(function(err, site){
			if (err){
				return next(err)
			}
		});
		console.log (site.rating);
		res.json({review: review, rating: site.rating});
	})
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