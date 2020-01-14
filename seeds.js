var mongoose = require('mongoose');
var Campground =require('./models/campgrounds');
var Comment 	= require('./models/comments')


var data = [
	{
		name: "Salmon Creek",
		image: "https://images.unsplash.com/photo-1533873984035-25970ab07461?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "blah blah blah"
	},
	{
		name: "Wonder Land",
		image: "https://images.unsplash.com/photo-1520824071669-892f70d8a23d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "blah blah blah"
	},
	{
		name: "Granite Hill",
		image: "https://images.unsplash.com/photo-1477581265664-b1e27c6731a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "blah blah blah"
	},
	{
		name: "Mountain Goat Rest",
		image: "https://images.unsplash.com/photo-1565053396207-75ca17bdf99c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "blah blah blah"
	},
	{
		name: "Salmon Creek",
		image: "https://images.unsplash.com/photo-1533873984035-25970ab07461?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "blah blah blah"
	},
	{
		name: "Wonder Land",
		image: "https://images.unsplash.com/photo-1520824071669-892f70d8a23d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "blah blah blah"
	}
]


function seedDB(){
// 		remove campground
	Comment.remove({});
	Campground.remove({}, function(err){
	console.log("removed campgrounds")
				// add campground
// 			data.forEach(function(seed){
// 				Campground.create(seed, function(err, newcamp){
// 					if(err){
// 						console.log(err)
// 					} else {
// 						console.log("added a campground")
// // 						create a comment
// 						Comment.create({text: "this place is great but no internet", author: "homer"}, (err, newcomment)=> {
// 							if(err){
// 								console.log(err);
// 							} else {
// 								newcamp.comments.push(newcomment)
// 								newcamp.save()
// 								console.log("created a new comment")
// 							}
// 						})
// 					}
// 				})
// 			})
	})	

		
}

	
module.exports = seedDB;