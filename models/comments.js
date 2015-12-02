var mongoose = require('mongoose');

var BlogCommentsSchema = new mongoose.Schema({
	body: String,
	createdBy: String,
	upVotes: {type: Number, default: 0},
	post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
});

BlogCommentsSchema.methods.upVote = function(cb){
	this.upVotes += 1;
	this.save(cb);
}

BlogCommentsSchema.methods.downVote = function(cb){
	this.upVotes -= 1;
	this.save(cb);
}

mongoose.model('BlogComments', BlogCommentsSchema);