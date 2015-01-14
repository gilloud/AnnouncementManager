var keystone = require('keystone'),
Types = keystone.Field.Types;

/**
 * Post Model
 * ==========
 */

var Announce = new keystone.List('AMAnnounce', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true }
});

Announce.add({
	title: { type: String, required: true },
	description: { type: Types.Html, wysiwyg: true, height: 150 },
	debut : {type: Types.Datetime,default: Date.now},
	fin : {type: Types.Datetime},
	nofin: { type: Boolean, label: 'Je ne connait pas l heure de fin', index: false ,default: false},
	categorie: { type: Types.Relationship, ref: 'AMCategory', many: false },
	author: { type: Types.Relationship, ref: 'User', index: true },
	nbWeekBeforeEvent : { type: Types.Number, initial: true, required: false },
	publishFrom : { type: Types.Date, initial: true, required: false },
	pubtype : {type : Types.Select, options: 'event, announce', default: 'event', index: true},
	announcePublished: { type: Boolean, label: 'Is announce published ?', index: true ,default: false}

});

Announce.relationship({ ref: 'AMPublication', path: 'announces' });


Announce.defaultColumns = 'title,description|20%,debut,categorie,author';
Announce.register();
