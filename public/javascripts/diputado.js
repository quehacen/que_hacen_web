$( document ).ready(function() {
	var tieneArt = $('.articulos_div div.tag').size();
	if (tieneArt == 0 ){
		$('.articulos_div').remove();
	}
});
