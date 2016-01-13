var mongoose = require('mongoose');

var ReviewSchema = new mongoose.Schema({
	title: String,
	body: String,
	createdBy: String,
	createDate: {type: Date, default: Date.now},
	rating: Number,
	upVotes: {type: Number, default: 0},
	site: {type: mongoose.Schema.Types.ObjectId, ref: 'Site'}
});

ReviewSchema.methods.upVote = function(cb){
	this.upVotes += 1;
	this.save(cb);
}

ReviewSchema.methods.downVote = function(cb){
	this.upVotes -= 1;
	this.save(cb);
}

mongoose.model('SiteReview', ReviewSchema);