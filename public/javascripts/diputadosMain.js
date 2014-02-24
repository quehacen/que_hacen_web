$(function(){
	
	var Diputados = Backbone.Collection.extend({
		url : 'http://localhost:3002/diputados'
	});

	var diputados = new Diputados([]);

	diputados.fetch({
		success: function() {
	    	console.log(diputados.length);
	  	}
	});

});