const 	express 	= require('express'),
	  	passport 	= require('passport'),
	  	User		= require('../models/user'),
		router	= express.Router();


router.get('/', (req,res) => {
		  res.render('landing')
})

// Auth Routes

router.get('/register', (req,res) =>{
	res.render('register');
})

router.post('/register', function(req,res){
	User.register(new User({username: req.body.username}), req.body.password, function(err,user){
		if(err){
			console.log(err);
			req.flash("error", err.message)
			return res.redirect('/register');
		}
		passport.authenticate('local')(req,res, function(){
			req.flash("success","Welcome to Yelpcamp " + user.username)
			res.redirect('/campgrounds')
		})
		
	})
})

router.get('/login', (req,res) => {
	res.render('login');
})


router.post('/login', passport.authenticate('local', {
	successRedirect: '/campgrounds',
	failureRedirect: '/login'
}))


router.get('/logout', function(req,res){
	req.logout()
	req.flash('success', 'Successfully Logged Out!!')
	res.redirect('/campgrounds')
})


module.exports = router;
