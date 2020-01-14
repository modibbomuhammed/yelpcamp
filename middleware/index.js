const Campground = require('../models/campgrounds'),
	  Comment 	= require('../models/comments')

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req,res,next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCamp){
			if(err || !foundCamp){
				req.flash("error", "Campground is not found!!")
				res.redirect('back')
			} else {
				if(foundCamp.author.id.equals(req.user._id)){
					next();
				} else {
					req.flash('error', 'You dont have permission to do that!!')
					res.redirect('back');
				}
			}
		})
	} else {
		req.flash('error', 'You need to be logged in to do that!!')
		res.redirect('back')
	}
}

	
	
middlewareObj.checkCommentOwnership	= function(req,res,next){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err || !foundComment){
			console.log(err);
			req.flash("error","Comment Not Found")
			res.redirect('back');
		} else {
			if(req.user && foundComment.author.id.equals(req.user.id)){
				next();
			} else {
				req.flash("error","You dont have permission")
				res.redirect("/campgrounds" + req.params.id);
			}
		}
	})
}

middlewareObj.isLoggedIn = function(req,res,next){
	if(req.isAuthenticated()){
		return next()
	}
	req.flash("error", "You need to be logged in to do that!!");
	res.redirect('/login');
}






module.exports = middlewareObj