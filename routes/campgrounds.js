const express 		= require('express'),
	  Campground	= require('../models/campgrounds'),
	  middleware	= require('../middleware'),
	  multer		= require('multer'),
	  cloudinary	= require('cloudinary'),
	  router	= express.Router(),
	  NodeGeocoder = require('node-geocoder');
		
// dotenv config
require("dotenv").config()

// Geocoder config
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'AIzaSyDhIy_frf-SdiVdnYVBMHNZv1Uu61MVtx4', //process.env.GEOCODERAPI_KEY,
  formatter: null
};
 
const geocoder = NodeGeocoder(options);

// multer config
const storage = multer.diskStorage({
	filename: function(req, file, cb){
		cb(null, file.fieldname + Date.now() + file.originalname)
	}
})

const upload = multer({
	storage,
	fileFilter: imageFilter
})

function imageFilter(req,file,cb){
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
}

// cloudinary config
cloudinary.config({
	cloud_name: 'modibbomuhammed',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
})
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

router.post('/', middleware.isLoggedIn, upload.single('image'), async (req,res) => {
	var newCampground = {name: req.body.name,
						 // image: req.body.image,
						 description: req.body.description,
						 price: req.body.price,
						 author:{
							 id: req.user._id,
							 username: req.user.username
						 }
						}
		try{
			let picture = await cloudinary.v2.uploader.upload(req.file.path)
			let data = await geocoder.geocode(req.body.location)
			console.log(data[0])
			newCampground.image = picture.secure_url;
			newCampground.imageId = picture.public_id;
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
			req.flash("error","Campground Not Found!!");
			res.redirect('back')
		} else {
			res.render('campgrounds/show', {camp: foundcamp });
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

router.put('/:id', middleware.checkCampgroundOwnership, upload.single('camp[image]'), async function(req,res){
	let newCamp = req.body.camp;
	newCamp.author = {
		id: req.user._id,
		username: req.user.username
	}
		try{
			let findCamp = await Campground.findById(req.params.id)
			await cloudinary.v2.uploader.destroy(findCamp.imageId)
			let picture = await cloudinary.v2.uploader.upload(req.file.path);
			newCamp.image = picture.secure_url;
			newCamp.imageId = picture.public_id;
			let data = await geocoder.geocode(newCamp.location)
			newCamp.lat = data[0].latitude;
			newCamp.lng = data[0].longitude;
			await Campground.findByIdAndUpdate(req.params.id, newCamp);
			req.flash("success", "You have updated your campground!!")
			res.redirect('/campgrounds/' + req.params.id);
		}
	
		catch(err){
			console.log(err)
			req.flash('error', `There was a problem due to ${err}`);
			res.redirect('/campgrounds');
		}
	
})

router.delete('/:id', middleware.checkCampgroundOwnership , async function(req,res){
	try{
		let findCamp = await Campground.findById(req.params.id);
		await cloudinary.v2.uploader.destroy(findCamp.imageId);
		await Campground.findByIdAndRemove(req.params.id);
		res.redirect('/campgrounds');
	}
	
	catch(err){
			console.log(err)
			res.redirect('/campgrounds')
	}
})



module.exports = router;