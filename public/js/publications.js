
var force_send = false;
var sendmail = function(id, type, alreadysent) {
	var send = false;

	if (type === 'test') {
		send = true;
	}

	if (type === 'prod') {


		if (confirm("Etes-vous sur de vouloir envoyer cet e-mail a toute l'église ?")) {
			if (alreadysent === false && force_send !== true) {
				send = true;
				force_send = true;
			} else {
				if (confirm("Un email a déjà été envoyé, êtes-vous sur ?")) {
					send = true;
					force_send = true;
				} else {
					send = false;
				}
			}

		} else {
			send = false;
		}
	}
	if (send) {
		$.ajax({
			dataType: 'text',
			type: 'GET',
			cache: false,
			url: "/mail/" + id + "/" + type,
			success: function(result) {
				alert(result);

			}
		});
	} else {
		alert("Le mail n'a pas été envoyé.");

	}

};