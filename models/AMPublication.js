var keystone = require('keystone'),
Types = keystone.Field.Types;

/**
 * PostCategory Model
 * ==================
 */

var AMPublication = new keystone.List('AMPublication', {
	autokey: { from: 'debut', path: 'key', unique: true },
	map: { name: 'debut' }

});

AMPublication.add({
	debut: { type: Types.Date,label: 'Jour de début de la période (eg: Dimanche)', required: true ,initial: true},
	fin: { type: Types.Date,label: 'Jour de début de la période (eg: Samedi)', required: true ,initial: true},

	description: { type: Types.Html, wysiwyg: true, height: 150 },
	announces: { type: Types.Relationship, ref: 'AMAnnounce', many: true },
	sent: {type: Boolean, label: 'Is publication sent ?', index: true ,default: false}
});

AMPublication.defaultColumns ='debut,fin,description,sent';

AMPublication.register();
