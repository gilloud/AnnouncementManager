var keystone = require('keystone'),
async = require('async'),
nodemailer = require("nodemailer"),
smtpTransport = require('nodemailer-smtp-transport');


exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
	locals = res.locals;
	
	// Set locals
	locals.section = 'mail';
	locals.filters = {
		publicationid: req.params.publicationid,
		sendmail:req.params.sendmail
	};
	locals.data = {
		publication : {},
		announces : [],
		announces_id : [],
		publicationannounce : [],
		categorie_id : [],
		shouldDisplay : {},
		httpPrefix : {}
	};

	var transporter = nodemailer.createTransport(smtpTransport({
		host: process.env.MAIL_SMTP,
		port: process.env.MAIL_PORT,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASSWORD
		}
	}));

	if(process.env.NODE_ENV === 'production')
	{
		locals.data.httpPrefix = 'http://annonces.epe-drac.fr'
	}else
	{
		locals.data.httpPrefix = 'http://localhost:3001'
	}

	view.on('init',function(next){
		keystone.list('AMPublication').model.findOne().where('_id',  locals.filters.publicationid).exec(function(err,result){

			
			locals.data.publication = result;
			next();
		});
	});

	view.on('init',function(next){
		keystone.list('AMPublicationAnnounce').model.find().where('publication',  locals.filters.publicationid).exec(function(err,result){

			locals.data.publicationannounce = result;
			next();
		});
	});

	view.on('init',function(next){
		for (var i = locals.data.publicationannounce.length - 1; i >= 0; i--) {
			locals.data.announces_id.push(locals.data.publicationannounce[i].announce);
		}
		next();

	});

	view.on('init',function(next){
		keystone.list('AMAnnounce').model.find().where({'_id': {$in : locals.data.announces_id}}).sort('-debut').populate('author').exec(function(err,result){

			locals.data.announces = result;
			next();
		});
	});

	view.on('init',function(next){
		for (var i = locals.data.announces.length - 1; i >= 0; i--) {
			locals.data.categorie_id.push(locals.data.announces[i].categorie);
		}
		next();

	});

	view.on('init',function(next){
		keystone.list('AMCategory').model.find().where({'_id': {$in : locals.data.categorie_id}}).sort('order').exec(function(err,result){

			locals.data.categories = result;
			next();
		});
	});



	view.on('init', function(next) {
		var view2 = new keystone.View(req, res);

		view2.render('mail', locals, function(err, html) {
			locals.data.renderedMail = html;
			
		});
		next();

	});

	// send mail !
	view.on('init',function(next){
	if(locals.filters.sendmail === 'test')
		{
			//send mail à moi
				transporter.sendMail({
				from: locals.user.name.first+' '+locals.user.name.last+' <louange@epe-drac.fr>',
				to: 'gilles@pilloud.fr',
				cc: locals.user.email+',gilles@pilloud.fr',
				subject: 'Annonces de la période du '+locals.data.publication._.debut.format('DD/MM/YYYY')+' au '+locals.data.publication._.fin.format('DD/MM/YYYY'),
				generateTextFromHTML: true,
				html: locals.data.renderedMail
			});
			locals.shouldDisplay = false;

		}else if(locals.filters.sendmail === 'prod')
		{
			//send mail à tous
			console.log('ici',locals.data.publication.id);
			keystone.list('AMPublication').model.update({
				'_id': locals.data.publication.id
			}, {
				sent: true
			}).exec(function(err, numAffected, c) {
				console.log('ok',err,numAffected);
			});
			transporter.sendMail({
				from: locals.user.name.first+' '+locals.user.name.last+' <louange@epe-drac.fr>',
				to: 'gilles@pilloud.fr',
				cc: locals.user.email+',gilles@pilloud.fr',
				subject: 'Annonces de la période du '+locals.data.publication._.debut.format('DD/MM/YYYY')+' au '+locals.data.publication._.fin.format('DD/MM/YYYY'),
				generateTextFromHTML: true,
				html: locals.data.renderedMail
			});

			for (var i = locals.data.announces.length - 1; i >= 0; i--) {
				keystone.list('AMAnnounce').model.update({
				'_id': locals.data.announces[i].id
			}, {
				announcePublished: true
			}).exec(function(err, numAffected, c) {
				console.log('ok',err,numAffected);
			});
			locals.shouldDisplay = false;
		}


		}else
		{
				locals.shouldDisplay = true;

		}
		next();
	});

/*

	view.on('init', function(next){

		view.render('sendmail', {}, function(err, html){
			console.log('aaa',err,html);
		});
		next();

	});
	
	// Render the view
	if(locals.filters.sendmail === 'test')
	{
		view.render('sendmail');
	}else if(locals.filters.sendmail === 'true')
	{
		view.render('sendmail');
	}else
	{
		view.render('mail');
	}
	*/
	view.render('sendmail');

};
