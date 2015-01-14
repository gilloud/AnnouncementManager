var addremove = function(action, publication, annonce) {
	$.ajax({
		dataType: 'text',
		type: 'GET',
		cache: false,
		url: "/publicationassoc/" + action + "/" + publication + "/" + annonce,
		success: function(result) {
			console.log('res:' + result);
			if (result == 'ok') {

				if (action === 'add') {
					setAreaSelected(annonce);

				} else {
					setAreaUnselected(annonce);
				}

			} else {
				alert("Erreur lors de la sauvegarde, merci de réessayer...");
			}
		}
	});
};

var setDefaultValue = function(annonce, isSelected) {
	if (isSelected === true) {
		setAreaSelected(annonce);
	} else {
		setAreaUnselected(annonce);
	}
};

var setAreaSelected = function(annonce) {
	document.getElementById('a_' + annonce).setAttribute('style', "background-color:#2EFE64;color:black");
	document.getElementById('link_add_' + annonce).setAttribute('style', "display:none");
	document.getElementById('link_remove_' + annonce).setAttribute('style', "");
};

var setAreaUnselected = function(annonce) {
	document.getElementById('a_' + annonce).setAttribute('style', "");
	document.getElementById('link_add_' + annonce).setAttribute('style', "");
	document.getElementById('link_remove_' + annonce).setAttribute('style', "display:none");
};