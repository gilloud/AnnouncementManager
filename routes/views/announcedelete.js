var keystone = require('keystone'),
AMAnnounce = keystone.list('AMAnnounce');
;

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
    locals = res.locals;
    // Init locals
    locals.section = 'announcedelete';
    locals.filters = {
        announceid: req.params.announceid,

    };
    locals.data = {
    };
    locals.formData = req.body || {};
    // Load all categories

    
        console.log('id :'+locals.filters.announceid);
        AMAnnounce.model.find().where({
            _id: locals.filters.announceid
        }).remove().exec(function(err) {
            console.log(err);
        });
    
    res.redirect('/');


};