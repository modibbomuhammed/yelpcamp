const mongoose 				= require('mongoose'),
	  passportLocalMongoose	= require('passport-local-mongoose');


const UserSchema = new mongoose.Schema({
	username: {type: String, unique: true, required: true},
	password: String,
	follower: [{
		type: mongoose.Schema.Types.ObjectId,
	}],
	firstName: String,
	lastName: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	avatar: String,
	email: {type: String, unique: true, required: true},
	isAdmin: {
		type: Boolean,
		default: false
	}
})

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema)