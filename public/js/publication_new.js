var addremove = function(action, publication, annonce) {

	$.ajax({
		url: "/publicationassoc/" + action + "/" + publication + "/" + annonce,
		success: function(result) {

			if (result === 'ok') {
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
	document.getElementById('a_' + annonce).style = "background-color:#2EFE64;color:black";
	document.getElementById('link_add_' + annonce).style = "display:none";
	document.getElementById('link_remove_' + annonce).style = "";
};

var setAreaUnselected = function(annonce) {
	document.getElementById('a_' + annonce).style = "";
	document.getElementById('link_add_' + annonce).style = "";
	document.getElementById('link_remove_' + annonce).style = "display:none";
};
