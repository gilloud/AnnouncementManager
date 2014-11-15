var keystone = require('keystone'),
async = require('async'),
AMPublicationAnnounce = keystone.list('AMPublicationAnnounce');


exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
	locals = res.locals;
	
	// Set locals
	locals.section = 'publicationassoc';
	locals.filters = {
		action: req.params.action,
		publication: req.params.publicationid,
		announce: req.params.announceid
	};
	locals.data = {
		returnvalue: []
	};
	
	// Load the current post
	view.on('init', function(next) {
		locals.data.returnvalue='koa';



		if(locals.filters.action == 'add')
		{
			delete locals.filters.action;
			var newAMPublicationAnnounce = new AMPublicationAnnounce.model(locals.filters);

			newAMPublicationAnnounce.save(function(err,publicationannounce) {
				console.log(err);
				locals.data.returnvalue = 'ok';
				next();
			});

		}else{
			delete locals.filters.action;
			AMPublicationAnnounce.model.find().where({$and: [{announce:locals.filters.announce},{publication:locals.filters.publication}]}).remove().exec(function(err)
			{
				console.log(err);
				locals.data.returnvalue='ok';
				next();
			});
		}

		
	});
	

	// Render the view
	view.render('publicationassoc');
	
};
