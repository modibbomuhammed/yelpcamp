const express 				= require('express'),
	  app					= express(),
	  bodyParser 			= require('body-parser'),
	  mongoose 				= require('mongoose'),
	  passport				= require('passport'),
	  LocalStrategy			= require('passport-local'),
	  passportLocalMongoose	= require('passport-local-mongoose'),
	  methodOverride		= require('method-override'),
	  flash		 			= require('connect-flash'),
	  expressSession		= require('express-session'),
	  Campground			= require('./models/campgrounds'),
	  User					= require('./models/user'),
	  Comment				= require('./models/comments'),
	  seedDB				= require('./seeds'),
	  port 					= 3000

const campgroundRoutes 		= require('./routes/campgrounds'),
	  commentsRoute			= require('./routes/comments'),
	  indexRoutes			= require('./routes/index');


require('dotenv').config()
	 	
app.set('view engine', "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride('_method'));

app.use(express.static(__dirname + '/public'))

console.log(process.env);

mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true})

.then(()=> console.log("Connected to the DB"))

.catch(err=> console.log(`Failed to connect to DB because of ${err}`))

// mongoose.set('useUnifiedTopology', true);

// seedDB();

// Campground.create(
// 	{
// 		name: 'Granite Hill',
// 		image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
// 		description: "A very nice place to chill out"
// 	}, (err, camp) => {
// 		if(err){
// 			console.log(err)
// 		} else {
// 			console.log(camp)
// 		}
// 	})



app.use(expressSession({
	secret: "whats up fellas",
	resave: false,
	saveUninitialized: false
}))

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser 	= req.user 
	res.locals.error		= req.flash("error");
	res.locals.success		= req.flash('success');
	next();
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentsRoute);
app.use(indexRoutes);

// console.log(process.env.PORT);
app.listen(port, function(){console.log("Server has started")})
