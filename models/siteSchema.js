var mongoose = require('mongoose');

var SiteSchema = new mongoose.Schema({
	name: String,
	status: {type: String, enum: ['Active', 'Inactive'], default: 'Active'},
	logoUrl: String,
	winAppUrl: String,
	appleAppUrl: String,
	androidAppUrl: String,
	description: String,
	detailedDescription: String,
	url: String,
	dealsUrl: String,
	serviceType: String,
	servicesOffered: String,
	subServices: String,
	alexaRanking: String,
	contactNumber: String,
	customerSupportId: String,
	customerSupportLink: String,
	paymentOptions: String,
	deliveryOptions: String,
	country: String,
	locationsCovered: String,
	minDeliveryDays: Number,
	maxDeliveryDays: Number,
	returnPolicy: String,
	traffic: String,
	rating: {type: Number, min: 0.0, max: 5.0, default: 0.0},
	numRatings: {type: Number, default: 0},
	createdBy: {type: String, default: 'admin'},
	createDate: {type: Date, default: Date.now},
	numReviews: {type: Number, default: 0},
	reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'SiteReview'}]
},
{
	collection: 'sites'
});

mongoose.model('Site', SiteSchema);