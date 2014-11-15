$('.form_datetime_debut').datetimepicker({
	language: 'fr',
	weekStart: 1,
	todayBtn: 1,
	autoclose: 1,
	todayHighlight: 1,
	startView: 2,
	forceParse: 0,
	showMeridian: 1,
	minuteStep: 15,
	linkField: "debut",
	linkFormat: "yyyy-mm-dd hh:ii"
});

$('.form_datetime_fin').datetimepicker({
	language: 'fr',
	weekStart: 1,
	todayBtn: 1,
	autoclose: 1,
	todayHighlight: 1,
	startView: 2,
	forceParse: 0,
	showMeridian: 1,
	minuteStep: 15,
	linkField: "fin",
	linkFormat: "yyyy-mm-dd hh:ii"
});


var debut = '';
var fin = '';

$('.form_datetime_fin')
.datetimepicker()
.on('changeDate', function(ev){


	fin = ev.date.valueOf();
	compare_dates('.form_datetime_fin');
});

$('.form_datetime_debut')
.datetimepicker()
.on('changeDate', function(ev){


	debut = ev.date.valueOf();
	compare_dates('.form_datetime_debut');
});

compare_dates = function(element)
{
	if(debut !== '' && fin !== '')
	{
		if(debut>fin)
		{
			alert('La date de début est supérieure à la date de fin de votre évènement !');
			document.getElementById('submitbtn').disabled = 'disabled';
		}
		else
		{
		document.getElementById('submitbtn').disabled = '';	
		}
	}

};