const 	express 	= require('express'),
	  	passport 	= require('passport'),
	  	User		= require('../models/user'),
	  	Campground	= require('../models/campgrounds'),
	  	sgMail 		= require('@sendgrid/mail'),
	  	nodemailer	= require('nodemailer'),
	  	async		= require('async'),
		crypto		= require('crypto'),
		router	= express.Router();



sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get('/', (req,res) => {
		  res.render('landing')
})

// Auth Routes

router.get('/register', (req,res) =>{
	res.render('register');
})

router.post('/register', function(req,res){
	let newUser = new User(req.body.register);
	if(req.body.adminCode === "1234"){
		newUser.isAdmin = true;
	}   
	User.register(newUser, req.body.password, function(err,user){
		if(err){
			console.log(err);
			req.flash("error", err.message)
			return res.redirect('/register');
		}
		passport.authenticate('local', { failWithError: true })(req,res, function(){
			req.flash("success","Welcome to Yelpcamp " + user.username)
			return res.redirect('/campgrounds')
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

// password forget

router.get('/forgot', (req,res) => {
	res.render('forgot');
})


router.post('/forgot', (req,res, next) => {
	async.waterfall([
		function(done){
			crypto.randomBytes(20, function(err,buf){
				var token = buf.toString('hex');
				done(err, token)
			})
		},
		
		function(token, done){
			User.findOne({email: req.body.email}, function(err, user){
				if(!user){
					req.flash("error", 'Sorry, no user exists with that account!!');
					return res.redirect('/login');
				}
					
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000  // one hour
				user.save(function(err){
					done(err,token, user)
				})
			})
		},
		
		function(token,user,done){
			var smtpTransport = nodemailer.createTransport({
        			service: 'Gmail', 
        			auth: {
          					user: 'modibbo4print@gmail.com',
          					pass: process.env.GMAILPW
        			}
			})
		
			var mailOptions = {
        							to: user.email,
        							from: 'modibbo4print@gmail.com',
        							subject: 'Node.js Password Reset',
        							text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          									'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
									  			'http://' + req.headers.host + '/reset/' + token + '\n\n' +
									  	'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      		};
			// sgMail.send(mailOptions);
			smtpTransport.sendMail(mailOptions, function(err) {
			console.log('mail sent');
			req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
			done(err, 'done');
			});
		}
	], function(err,result){
		if(err){
			return next(err);
		} else {
			console.log(result);
			res.redirect('/forgot');
		}
	})
})



router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'modibbo4print@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'modibbo4print@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});




// user profile
router.get('/users/:user_id', async (req,res) => {
	try{
		let userprofile = await User.findById(req.params.user_id)
		let camps = await Campground.find().where('author.id').equals(userprofile._id)
		console.log(camps);
		console.log(userprofile);
		res.render('users/show', {user: userprofile, campgrounds: camps});	
	}
	catch(err){
		console.log(err)
	}
	
})


module.exports = router;
