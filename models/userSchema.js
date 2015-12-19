var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var dialog = require('dialog');

var UserSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true},
    role: String,
	hash: String,
	salt: String,
	firstname: String,
	lastname: String,
    mailid: String,
	rating: {type: Number, default: 0},
    points: {type: Number, default: 0},
    profilePhoto: {data: Buffer, type: String}
});

UserSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex');
	console.log(password);
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
}

UserSchema.methods.validPassword = function(password){
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	return this.hash === hash;
}

UserSchema.methods.generateJWT = function(){
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 60);
	
	return jwt.sign({
		_id: this._id,
		username: this.username,
        role: this.role,
		exp: parseInt(exp.getTime()/1000),
	}, 'SECRET');
}


mongoose.model('User', UserSchema);