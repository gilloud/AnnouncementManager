var keystone = require('keystone'),
async = require('async'),
AMAnnounce = keystone.list('AMAnnounce'),
moment = require('moment');


exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
	locals = res.locals;
	
	// Init locals
	locals.section = 'announce_new';
	locals.filters = {
		category: req.params.category,
		announceid : req.params.announceid
	};
	locals.data = {
		posts: [],
		categories: [],
		AMCategory : [],
		announce : []
	};
	locals.formData = req.body || {};

	
	view.on('init',function(next){

		if(locals.filters.announceid !== undefined)
		{
			keystone.list('AMAnnounce').model.findOne().where('_id',  locals.filters.announceid).populate('author').exec(function(err,result){

				locals.data.announce = result;
				next();
			});
		}else
		{
			next();
		}
	});

	view.on('init',function(next){

		if(locals.filters.announceid !== undefined)
		{
			keystone.list('AMPublicationAnnounce').model.find().where('announce',  locals.filters.announceid).populate('publication').exec(function(err,result){

				locals.data.publications = result;
				next();
			});
		}else
		{
			next();
		}
	});


	view.on('init', function(next) {
		locals.data.nbWeekBeforeEvent = [	{key:1,value:'Une semaine avant'} ,
		{key:2,value:'Deux semaines avant'},
		{key:3,value:'Trois semaines avant'},
		{key:4,value:'Quatre semaines avant'},
		{key:5,value:'Cinq semaines avant'}];
		next();
	});
	// Load all categories
	view.on('init', function(next) {
		

		keystone.list('AMCategory').model.find().sort('order').exec(function(err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.data.AMCategory = results;
            //console.log('events:', locals.data.events);
            next();
        });
		
	});

	view.on('post', function(next) {

		if (!locals.user)
		{
			next('not connected');
		}
		delete locals.formData.submit;

		locals.formData.author = locals.user.id;

		if(locals.formData.pubtype === 'announce')
		{
			delete locals.formData.nbWeekBeforeEvent;
			delete locals.formData.debut;
			delete locals.formData.fin;
		}

		if(locals.formData.pubtype === 'event')
		{
			var publishFrom = moment(Date.parse(locals.formData.debut)).subtract(locals.formData.nbWeekBeforeEvent, 'weeks');
			publishFrom.set('hour',0);
			publishFrom.set('minute',0);
			publishFrom.set('second', 0);
			locals.formData.publishFrom = publishFrom.toDate();
		}



		if("id" in locals.formData )
		{
			console.log('update');
			var id = locals.formData.id;
			delete locals.formData.id;

			keystone.list('AMAnnounce').model.update({'_id': id}, locals.formData).exec(function(err, numAffected, c) {
				return res.redirect('/announce/'+id);

			});
		}
		else
		{
			console.log('insert');
			var newAMAnnounce = new AMAnnounce.model(locals.formData);

			newAMAnnounce.save(function(err,announce) {
				return res.redirect('/announce/'+announce.id);
			});

		}
	});
	
	// Render the view
	view.render('announce_new');
	
};
