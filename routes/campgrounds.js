const express 	= require('express'),
	  Campground = require('../models/campgrounds'),
	  middleware = require('../middleware'),
	  router	= express.Router(),
	  NodeGeocoder = require('node-geocoder');
		
 

require("dotenv").config()
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODERAPI_KEY,
  formatter: null
};
 
const geocoder = NodeGeocoder(options);


// campground routes

router.get('/', (req,res) => {
	Campground.find({}, function(err,campgrounds){
		if(err){
			console.log(err)
		} else {
			res.render('campgrounds/index', {data: campgrounds})		
		}
	})
  	
})

router.post('/', middleware.isLoggedIn, async (req,res) => {
	var newCampground = {name: req.body.name,
						 image: req.body.image,
						 description: req.body.description,
						 price: req.body.price,
						 author:{
							 id: req.user._id,
							 username: req.user.username
						 }
						}
		try{
			let data = await geocoder.geocode(req.body.location)
			console.log(data[0])
			newCampground.lat = data[0].latitude;
			newCampground.lng = data[0].longitude;
			newCampground.location = data[0].formattedAddress;
			await Campground.create(newCampground);
			req.flash("success", "You have added a campground")
			res.redirect('/campgrounds');
		}
		
		catch(err){
				console.log(err);
				req.flash("error", "Failed to create campground due to " + err)
				res.redirect("back")
		}
});
	

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
				res.render('campgrounds/edit', {camp: foundCamp});
				
			}
		});	
	
	
})

router.put('/:id', middleware.checkCampgroundOwnership , async function(req,res){
	let newCamp = req.body.camp;
	newCamp.author = {
		id: req.user._id,
		username: req.user.username
	}
		try{
			let data = await geocoder.geocode(newCamp.location)
			newCamp.lat = data[0].latitude;
			newCamp.lng = data[0].longitude;
			let updatedCamp = await Campground.findByIdAndUpdate(req.params.id, newCamp)
			console.log(updatedCamp)
			req.flash("success", "You have updated your campground!!")
			res.redirect('/campgrounds/' + updatedCamp._id);
		}
	
		catch(err){
			console.log(err)
			req.flash('error', `There was a problem due to ${err}`);
		}
	
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