var mongoose = require('mongoose');

var BlogPostSchema = new mongoose.Schema({
	title: String,
	body: String,
	link: String,
	upVotes: {type: Number, default: 0},
	votesBy: [{type: String}],
	createdBy: String,
	createDate: Date,
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'BlogComments'}]
});

BlogPostSchema.methods.upVote = function(username, cb){
	if (this.checkVotesBy(username)){
		this.upVotes += 1;
		this.votesBy.push(username);
		this.save(cb);
	}
}

BlogPostSchema.methods.downVote = function(username, cb){
	if (this.checkVotesBy(username)){
		this.upVotes -= 1;
		this.votesBy.push(username);
		this.save(cb);
	}
}

BlogPostSchema.methods.checkVotesBy = function(username){
	for (var i = 0; i < this.votesBy.length; i++){
		if (this.votesBy[i] === username){
			return false;
		}
	}
	return true;
}

mongoose.model('Post', BlogPostSchema);