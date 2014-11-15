var keystone = require('keystone'),
	async = require('async');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	// Init locals
	locals.section = 'announces';
	locals.filters = {
		category: req.params.category
	};
	locals.data = {
		posts: [],
		categories: []
	};

	// Load all categories
	view.on('init', function(next) {

		keystone.list('AMCategory').model.find().sort('name order').exec(function(err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.data.categories = results;

			// Load the counts for each category
			async.each(locals.data.categories, function(category, next) {

				keystone.list('AMAnnounce').model.count().where('categorie').in([category.id]).exec(function(err, count) {
					category.postCount = count;
					next(err);
				});

			}, function(err) {
				next(err);
			});

		});

	});

	// Load the current category filter
	view.on('init', function(next) {

		console.log(req.params.category);
		if (req.params.category) {
			keystone.list('AMCategory').model.findOne({
				key: locals.filters.category
			}).exec(function(err, result) {
				locals.data.category = result;
				next(err);
			});
		} else {
			next();
		}

	});

	// Load the posts
	view.on('init', function(next) {

		var q = keystone.list('AMAnnounce').paginate({
				page: req.query.page || 1,
				perPage: 10,
				maxPages: 10
			})
			//.where('state', 'published')
			.sort('-publishedDate')
			.populate('author categorie');

		if (locals.data.category) {
			q.where('categorie').in([locals.data.category]);
		}
		var v_now = new Date();
		q.where({
			$or: [{
				$and: [{
					'pubtype': 'announce'
				}, {
					'announcePublished': false
				}]
			}, {
				$and: [{
					'pubtype': 'event'
				}, {
					'debut': {
						$gt: v_now
					}
				}]
			}]
		});
		//q.where('debut').gt(new Date())

		if (!locals.user.canAccessKeystone) {
			q.where('author').in([locals.user.id]);
		}

		q.exec(function(err, results) {
			locals.data.posts = results;
			next(err);
		});

	});

	// Render the view
	view.render('announces');

};