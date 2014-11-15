var keystone = require('keystone'),
	async = require('async'),
	AMPublication = keystone.list('AMPublication');


exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	// Init locals
	locals.section = 'publication_new';
	locals.filters = {
		publicationid: req.params.publicationid
	};
	locals.data = {
		posts: [],
		categories: [],
		AMCategory: [],
		publication: []
	};
	locals.formData = req.body || {};


	view.on('init', function(next) {

		if (locals.filters.publicationid !== undefined) {
			keystone.list('AMPublication').model.findOne().populate('').where('_id', locals.filters.publicationid).exec(function(err, result) {

				locals.data.publication = result;
				next();
			});
		} else {
			next();
		}
	});

	view.on('init', function(next) {

		if (locals.filters.publicationid !== undefined) {
			keystone.list('AMPublicationAnnounce').model.find().where('publication', locals.filters.publicationid).exec(function(err, result) {

				locals.data.publicationannounces = result;
				//				console.log("iciiiii",locals.data.publicationannounces);
				next();
			});
		} else {
			next();
		}
	});

	view.on('init', function(next) {
		if (locals.filters.publicationid !== undefined) {

			locals.data.publicationannounces_announces = [];
			for (var i = locals.data.publicationannounces.length - 1; i >= 0; i--) {
				locals.data.publicationannounces_announces.push(locals.data.publicationannounces[i].announce);
			}
		}
		next();
		//console.log(locals.data.publicationannounces_announces);
	});

	view.on('init', function(next) {

		if (locals.filters.publicationid === undefined) {
			next();
		} else {
			var q = keystone.list('AMAnnounce').model.find().populate('categorie author').sort('debut categorie');

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
							$gt: locals.data.publication.debut
						}
					}, {
						'publishFrom': {
							$lt: locals.data.publication.debut
						}
					}]
				}, {
					'_id': {
						$in: locals.data.publicationannounces_announces
					}
				}]
			});
			console.log('announces');
			q.exec(function(err, results) {
				//				console.log(err);

				//				console.log('-----------');
				for (var i = results.length - 1; i >= 0; i--) {
					results[i].associated = 'false';
					for (var j = locals.data.publicationannounces.length - 1; j >= 0; j--) {

						if (locals.data.publicationannounces[j].announce + "" == results[i]._id + "") {
							results[i].associated = 'true';
							//							console.log('truuue');

						} else {
							//							console.log('false');
						}
					}
				}
				locals.data.announces = results;
				next(err);
			});

		}
	});


	view.on('post', function(next) {
		if (!locals.user) {
			next('not connected');
		}
		delete locals.formData.submit;

		locals.formData.author = locals.user.id;


		// Do update
		if ("id" in locals.formData) {
			console.log('update');
			var id = locals.formData.id;
			delete locals.formData.id;

			keystone.list('AMPublication').model.update({
				'_id': id
			}, locals.formData).exec(function(err, numAffected, c) {
				return res.redirect('/publications/');

			});
		}
		// Do create
		else {
			console.log('insert');


			var q = keystone.list('AMAnnounce').model.find().populate('categorie author').sort('debut categorie');

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
							$gt: locals.formData.debut
						}
					}, {
						'publishFrom': {
							$lt: locals.formData.debut
						}
					}]
				}]
			});

			locals.formData.announces = [];
			q.exec(function(err, results) {
				for (var i = results.length - 1; i >= 0; i--) {
					locals.formData.announces.push(results[i].id);
					console.log('id', results[i].id);
				}
				//locals.formData.announces = results;
				console.log('locals.formData.announces', locals.formData.announces);

				var newAMPublication = new AMPublication.model(locals.formData);

				newAMPublication.save(function(err, publication) {
					console.log(err);
					return res.redirect('/publication/' + publication.id);
				});
			});


		}
	});

	// Render the view
	view.render('publication_new');



	function contains(a, obj) {
		for (var i = 0; i < a.length; i++) {
			if (a[i] === obj) {
				return true;
			}
		}
		return false;
	}
};