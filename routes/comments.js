const 	express 	= require('express'),
	  	Campground 	= require('../models/campgrounds'),
	  	middleware	= require('../middleware'),
	  	Comment		= require('../models/comments'),
	  	indexRoutes	= require('./index'),
		router		= express.Router({mergeParams: true});


// ====================
// comments route
// ===================

router.get("/new", middleware.isLoggedIn, (req,res) => {
	var identity = req.params.id
	Campground.findById(identity, function(err, foundcamp){
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {camp: foundcamp})		
		}
	})
	
})

router.post('/', middleware.isLoggedIn, function(req,res){
	Campground.findById(req.params.id, function(err, foundcamp){
		if(err || !foundcamp){
			console.log(err);
			req.flash("error","Campground Not Found!!");
			res.redirect('back')
		} else {
			Comment.create(req.body.comment, function(err, newcomm){
				if(err){
					console.log(err);
				} else {
					// console.log(newcomm)
					// console.log(foundcamp)
					newcomm.author.id = req.user._id;
					newcomm.author.username = req.user.username;
					newcomm.save();
					foundcamp.comments.push(newcomm);
					foundcamp.save()
					console.log(newcomm);
					req.flash('success', 'You Have Successfully Added A Comment!!')
					res.redirect('/campgrounds/' + req.params.id)
				}
			})
		}
	})

})

router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req,res) => {
	Campground.findById(req.params.id).populate('comments').exec(function(err, foundCamp){
		if(err || !foundCamp){
			req.flash("error","Campground Not Found")
			res.redirect('back')
		} else {
			Comment.findById(req.params.comment_id, function(err, foundComment){
				if(err){
					res.redirect('back');
				} else {
					// console.log(foundCamp)
					// console.log("=======")
					// console.log(foundComment)
				res.render('comments/edit', {comment: foundComment, camp: foundCamp})		
				}
			})
					
		}
	})
	
})

router.put('/:comment_id', middleware.checkCommentOwnership,function(req,res){
	let update = {text: req.body.comment.text}
	Comment.findByIdAndUpdate(req.params.comment_id, update, function(err, updatedComment){
		if(err){
			console.log('back')
		} else {
			console.log(updatedComment);
			req.flash("success","You're Comment Has Been Updated!!")
			res.redirect('/campgrounds/' + req.params.id)
		}
	})
})

router.delete('/:comment_id', middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			console.log(err);
			res.redirect('back')
		}
		req.flash("success","You're Comment Has Been Deleted!!")
		res.redirect('/campgrounds/' + req.params.id);
	})	
})



module.exports = router;