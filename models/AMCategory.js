var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * PostCategory Model
 * ==================
 */

var AMCategory = new keystone.List('AMCategory', {
	autokey: { from: 'name', path: 'key', unique: true }
});

AMCategory.add({
	name: { type: String, required: true },
	description: { type: String, required: false, initial: true },
	order: { type: Types.Number, initial: true, required: false },
	for_all: {type: Boolean, label: 'Is this category usable by all ?', index: true ,default: false},
	date_display_mode: {
		type: Types.Select,
		options: [{
			value: 'dateheure',
			label: 'Date et heure'
		}, {
			value: 'date',
			label: 'Date seulement'
		},{
			value: 'anniversaire',
			label: 'Affiche "... a son anniversaire le ..."'
		},{
			value: 'menage',
			label: 'Affiche "Le menage est a faire par ... pour le ..."'
		},{
			value: 'none',
			label: 'N affiche ni date ni heure' 
		}],
		default: 'dateheure',
		index: true
	},

});

AMCategory.relationship({ ref: 'AMAnnounce', path: 'categorie' });

AMCategory.register();

AMCategory.defaultColumns = 'name,description,order,for_all,date_display_mode';

