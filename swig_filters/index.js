var moment = require('moment');
var _ = require('underscore.string');
var cheerio = require('cheerio');

module.exports= function(swig){
	/***** SWIG FILTERS *****/
	swig.setFilter('length', function (input, idx) {
		var __ = require('lodash');
		
		if ( __.isString(input) ){
			return __.size(input);
		} else if( __.isArray(input) ){
			return input.length;
		} else if ( __.isObject(input) ){
			return __.size(input);
		} else {
			return false;
		}

	});
	
	swig.setFilter('pluck', function (input, key) {
		var __ = require('lodash');
	  	return __.pluck(input, key);
	});

	swig.setFilter('slugify', function (input) {
	  return _.slugify(input) || 0;
	});

	swig.setFilter('fecha', function(input) {
	  
	  var date = input;
	  var dateLength = date.split('/').length;

	  if( dateLength <= 1 || dateLength > 3 ) { 
	    return date; 
	  } else if ( dateLength == 2 ) {
	    return moment(date, "MM-YYYY").lang('es').format('LL');
	  } else {
	    return moment(date, "DD-MM-YYYY").lang('es').format('LL');
	  }

	});

	swig.setFilter('dateFromNow', function(input){
	 return moment(input).lang('es').fromNow();
	});

	swig.setFilter('euros', function(input){
	  if(input){ return _.numberFormat(input, 2, ',', '.') + "€"; }
	  else { return '--'; }
	});

	swig.setFilter('post_img_src', function(input){
	  var $ = cheerio.load(input);
	  return $("img").attr('src');
	});

	swig.setFilter('post_img_alt', function(input){
	  var $ = cheerio.load(input);
	  return $("img").attr('alt');
	});

	swig.setFilter('cargo_friendly_h', function (input){
	  switch(input){
	     case 'P': return 'Presidente';
	     case 'VP': return 'Vicepresidente';
	     case 'VP1': return 'Vicepresidente 1º';
	     case 'VP2': return 'Vicepresidente 2º';
	     case 'VP3': return 'Vicepresidente 3º';
	     case 'VP4': return 'Vicepresidente 4º';
	     case 'S': return 'Secretario';
	     case 'S1': return 'Secretario 1º';
	     case 'S2': return 'Secretario 2º';
	     case 'S3': return 'Secretario 3º';
	     case 'S4': return 'Secretario 4º';
	     case 'POT': return 'Portavoz Titular';
	     case 'POS': return 'Portavoz Suplente';
	     case 'POA': return 'Portavoz Adjunto';
	     case 'PO': return 'Portavoz';
	     case 'VS': return 'Vocal Suplente';
	     case 'V': return 'Vocal';
	     case 'A': return 'Adscrito';
	  }
	  return input;
	});

	swig.setFilter('cargo_friendly_m', function (input){
	  switch(input){
	     case 'P': return 'Presidenta';
	     case 'VP': return 'Vicepresidentaª';
	     case 'VP1': return 'Vicepresidenta 1ª';
	     case 'VP2': return 'Vicepresidenta 2ª';
	     case 'VP3': return 'Vicepresidenta 3ª';
	     case 'VP4': return 'Vicepresidenta 4ª';
	     case 'S': return 'Secretaria';
	     case 'S1': return 'Secretaria 1ª';
	     case 'S2': return 'Secretaria 2ª';
	     case 'S3': return 'Secretaria 3ª';
	     case 'S4': return 'Secretaria 4ª';
	     case 'POT': return 'Portavoz Titular';
	     case 'POS': return 'Portavoz Suplente';
	     case 'POA': return 'Portavoz Adjunta';
	     case 'PO': return 'Portavoz';
	     case 'VS': return 'Vocal Suplente';
	     case 'V': return 'Vocal';
	     case 'A': return 'Adscrita';
	  }
	  return input;
	});

	swig.setFilter("cargo_tipo",function(input){
	  switch(input){
	     case 'P': return 'Presidencia';
	     case 'VP': case 'VP1': case 'VP2': case 'VP3': case 'VP4': return 'Vicepresidentes';
	     case 'S': case 'S1': case 'S2': case 'S3': case 'S4': return 'Secretarios';
	     case 'POT': return 'Portavoces Titulares';
	     case 'POS': return 'Portavoces Suplentes';
	     case 'POA': return 'Portavoces Adjuntos';
	     case 'PO': return 'Portavoces';
	     case 'VS': return 'Vocales Suplentes';
	     case 'V': return 'Vocales';
	     case 'A': return 'Adscritos';
	  }
	  return input;
	});

	swig.setFilter("cargos_ord",function(input){
	   var __=require('lodash');
	   var ordenado=[];
	   var tiposcargo= ["P","VP","VP1","VP2","VP3","VP4","S","S1","S2","S3",
		"S4","PO","POT","POS","POA","V","VS","A"];
	   __.each(tiposcargo,function(tipocargo){
	      __.each(input,function(cargoi){
	         if(cargoi.cargo == tipocargo){
                    ordenado.push(cargoi);
		 }
              });
	   });
	   return ordenado;
	});

	swig.setFilter("poda_con",function(input,field,val){
	   var __=require('lodash');
	   var anew=[];
	   if(arguments.length!=3){
	      __.each(input,function(elem){
		 __.each(elem,function(value,key,list){
	            if(key == field){
                       anew.push(elem);
		    }
		 });
	      });
	   }else{
	      __.each(input,function(elem){
		 __.each(elem,function(value,key,list){
	            if(key == field && value == val){
                    	anew.push(elem);
		    }
		 });
	      });
	   }
	   return anew;
	});


	swig.setFilter("poda_sin",function(input,field,val){
	   var __=require('lodash');
	   var anew=[];
	   var inside;
	   if(arguments.length!=3){
	      __.each(input,function(elem){
	         inside=false;
		 __.each(elem,function(value,key,list){
		    if(key == field){
                       inside=true;
		    }
		 });
		 if(inside==false){anew.push(elem);}
	      });
	   }else{
	      __.each(input,function(elem){
		 __.each(elem,function(value,key,list){
	            if(key == field && value != val){
                    	anew.push(elem);
		    }
		 });
	      });
	   }
	   return anew;
	});

	swig.setFilter("dipusorg",function(input,idorg){
	   var __=require('lodash');
	   var dipusorg=[];
	   var temp,fila;
	   __.each(input,function(dipu){
		__.each(dipu.cargos_congreso,function(c){
			if(c.idOrgano==idorg){
				temp={}
				__.each(dipu,function(value,key,list){
					if(key!="cargos_congreso"){
						temp[key]=value;
					}
				});	
				temp.cargo=c.cargo;
				temp.alta=c.alta;
				if(typeof c.baja !== "undefined"){temp.baja=c.baja;}
				dipusorg.push(temp);
				delete temp;
			}
		});
	   });
	   return dipusorg;
	});

	swig.setFilter("groupBy", function (input, key) {
		var __ = require('lodash');
	  if (!__.isArray(input)) {
	    return input;
	  }

	  var out = {};

	  __.each(input, function (value) {
	    if (!value.hasOwnProperty(key)) {
	      return;
	    }

	    var keyname = value[key],
	      newVal = __.extend({}, value);
	    delete value[key];

	    if (!out[keyname]) {
	      out[keyname] = [];
	    }

	    out[keyname].push(value);
	  });

	  return out;
	});
	/****END SWIG FILTERS *****/
}
