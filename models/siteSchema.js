var mongoose = require('mongoose');

var SiteSchema = new mongoose.Schema({
	title: String,
	body: String,
	link: String,
	upVotes: {type: Number, default: 0},
	votesBy: [{type: String}],
	createdBy: String,
	createDate: Date,
	reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'SiteReview'}]
});

SiteSchema.methods.upVote = function(username, cb){
	if (this.checkVotesBy(username)){
		this.upVotes += 1;
		this.votesBy.push(username);
		this.save(cb);
	}
}

SiteSchema.methods.downVote = function(username, cb){
	if (this.checkVotesBy(username)){
		this.upVotes -= 1;
		this.votesBy.push(username);
		this.save(cb);
	}
}

SiteSchema.methods.checkVotesBy = function(username){
	for (var i = 0; i < this.votesBy.length; i++){
		if (this.votesBy[i] === username){
			return false;
		}
	}
	return true;
}

mongoose.model('Site', SiteSchema);