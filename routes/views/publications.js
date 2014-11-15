var keystone = require('keystone'),
	async = require('async'),
	moment = require('moment');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	// Init locals
	locals.section = 'publications';
	locals.filters = {
		category: req.params.category
	};
	locals.data = {
		posts: [],
		categories: [],
		publications : []
	};
	

	
	// Load the posts
	view.on('init', function(next) {
		
		var q = keystone.list('AMPublication').model.find().where('sent',true).limit(100).sort('-debut');
		
		
		q.exec(function(err, results) {
			locals.data.publications = results;
			next(err);
		});
		
	});

	view.on('init', function(next) {
		
		var q = keystone.list('AMPublication').model.find().where('sent',false).sort('debut');
		
		
		q.exec(function(err, results) {
			locals.data.nonsentpublications = results;
			next(err);
		});
		
	});

	
	
	// Render the view
	view.render('publications');
	
};
