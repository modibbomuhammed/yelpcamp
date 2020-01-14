const express 	= require('express'),
	  Campground = require('../models/campgrounds'),
	  middleware = require('../middleware'),
	  router	= express.Router();


// campground routes

router.get('/', (req,res) => {
	Campground.find({}, function(err,campgrounds){
		if(err){
			console.log(err)
		} else {
			// console.log(campgrounds)
			res.render('campgrounds/index', {data: campgrounds})		
		}
	})
  	
})

router.post('/', middleware.isLoggedIn, (req,res) => {
	var newCampground = {name: req.body.name,
						 image: req.body.image,
						 description: req.body.description,
						 price: req.body.price,
						 author:{
							 id: req.user._id,
							 username: req.user.username
						 }
						}
		Campground.create(newCampground, function(err, campground){
		if(err){
			console.log(err)
		} else {
			console.log('you have added a campground to db')
			// console.log(campground)
			res.redirect('/campgrounds')
		}
	});
	
	
})


router.get('/new', middleware.isLoggedIn,(req,res) => {
	res.render('campgrounds/new')
})

router.get('/:id', (req,res) => {
	var identity = req.params.id;
	Campground.findById(identity).populate('comments').exec(function(err, foundcamp){
		if(err || !foundcamp){
			console.log(err);
			req.flash("error","Campground Not Found!!");
			res.redirect('back')
		} else {
			console.log(foundcamp);
			res.render('campgrounds/show', {camp: foundcamp});
		}
	})
})


router.get('/:id/edit', middleware.checkCampgroundOwnership ,function(req,res){
		Campground.findById(req.params.id, function(err, foundCamp){
			if(err || !foundCamp){
				console.log(err)
				req.flash("error","Campground Not Found!")
				res.redirect('back');
			} else {
				console.log(typeof foundCamp.author.id)
				console.log(typeof req.user._id)
				console.log(foundCamp.author.id)
				console.log(req.user._id)
				res.render('campgrounds/edit', {camp: foundCamp});
				
			}
		});	
	
	
})

router.put('/:id', middleware.checkCampgroundOwnership ,function(req,res){
	let newCamp = {
		name: req.body.name,
		image: req.body.image,
		description: req.body.description	
	}
	Campground.findByIdAndUpdate(req.params.id, newCamp, function(err,updatedCamp){
		if(err){
			console.log(err);
		} else {
			console.log(updatedCamp);
			res.redirect('/campgrounds/' + updatedCamp._id);
		}
	})
})

router.delete('/:id', middleware.checkCampgroundOwnership ,function(req,res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err)
			res.redirect('/campgrounds')
		} else {
			res.redirect('/campgrounds')
		}
	})
})



module.exports = router;