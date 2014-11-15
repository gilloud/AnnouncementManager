var keystone = require('keystone'),
Types = keystone.Field.Types;

/**
 * Post Model
 * ==========
 */

var PublicationAnnounce = new keystone.List('AMPublicationAnnounce', {
//	map: {  },
//	autokey: { path: 'slug', from: 'title', unique: true }
});

PublicationAnnounce.add({
	publication: { type: Types.Relationship, ref: 'AMPublication', many: false },
	announce: { type: Types.Relationship, ref: 'AMAnnounce', index: true }

});

PublicationAnnounce.relationship({ ref: 'AMPublication', path: 'publication' });
PublicationAnnounce.relationship({ ref: 'AMAnnounce', path: 'announce' });


PublicationAnnounce.defaultColumns = 'publication,announce';
PublicationAnnounce.register();
