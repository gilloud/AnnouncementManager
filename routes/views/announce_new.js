var keystone = require('keystone'),
async = require('async'),
AMAnnounce = keystone.list('AMAnnounce'),
moment = require('moment'),
nodemailer = require("nodemailer"),
smtpTransport = require('nodemailer-smtp-transport');


//fs = require('fs');

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
	locals.filesData = req.files || {};

	var transporter = nodemailer.createTransport(smtpTransport({
		host: process.env.MAIL_SMTP,
		port: process.env.MAIL_PORT,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASSWORD

		},
		secureConnection: false ,
		debug:true
	}));
	
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

				/* Envoi d'un mail au soumetteur + responsable */
				transporter.sendMail({
					from: 'EpedAnnonce <annonces@epe-drac.fr>',
					to: 'gilles@pilloud.fr;'+locals.user.email,
					subject: 'Annonce mise à jour : '+locals.data.title,
					generateTextFromHTML: true,
					html: 'Bonjour,<br /> Une annonce a été mise à jour. Voici son récapituatif :<br />'
					+ 'Auteur : '+locals.user.name.first+' '+locals.user.name.last+'<br />'
					+ 'Titre :'+locals.formData.title+'<br />'
					+ 'Description :'+locals.formData.description+'<br />'
					+ '<a href="'+'http://annonces.epe-drac.fr/announce/'+id+'">Voir les détails</a>'
				}, function(error, info){
					if(error){
						console.log(error);
					}else{
						console.log('Message sent: ' + info.response);
					}
				});

				return res.redirect('/announce/'+id);

			});
		}
		else
		{
			console.log('insert',locals.formData);

			var newAnnounce = new AMAnnounce.model({
			author: locals.user.id,
			publishedDate: new Date()
		}),
		updater = newAnnounce.getUpdateHandler(req, res, {
			errorMessage: 'There was an error creating your new post:'
		});

		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: ''
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				
				/* Envoi d'un mail au soumetteur + responsable */
				transporter.sendMail({
					from: 'EpedAnnonce <annonces@epe-drac.fr>',
					to: 'gilles@pilloud.fr'+locals.user.email,
					subject: 'Une nouvelle annonce a été soumise : '+locals.data.title,
					generateTextFromHTML: true,
					html: 'Bonjour,<br /> Une nouvelle annonce a été soumise. Voici son récapituatif :<br />'
					+'Auteur : '+locals.user.name.first+' '+locals.user.name.last+'<br />'
					+ 'Titre :'+locals.formData.title+'<br />'
					+ 'Description :'+locals.formData.description+'<br />'
					+ '<a href="'+'http://annonces.epe-drac.fr/announce/'+newAnnounce.id+'">Voir les détails</a>'
				}, function(error, info){
					if(error){
						console.log(error);
					}else{
						console.log('Message sent: ' + info.response);
					}
				});
				return res.redirect('/announce/'+newAnnounce.id);
				
			}
			next();
		});

}
});

	// Render the view
	view.render('announce_new');
	
};
