var request = require('request');
var rsj = require('rsj');
var _ = require('lodash');
var _String = require('underscore.string');
var APIUrl = 'http://localhost:3002';
var BLOGUrl = 'http://quehacenlosdiputados.net'

exports.ultimas_iniciativas = function(req, res){ 
	request( APIUrl+"/iniciativas?limit=2", function(error, response, body) {
	  res.render('modules/ultimas-iniciativas',{'iniciativas':JSON.parse(body)}); 
	});
};

exports.ultimas_votaciones = function(req, res){ 
	request( APIUrl+'/votaciones?limit=2&not=["xml.resultado.votaciones"]', function(error, response, body) {
	  res.render('modules/ultimas-votaciones',{'votaciones':JSON.parse(body)}); 
	});
};

exports.ultimos_posts = function(req, res){
	rsj.r2j( BLOGUrl+'/feed/', function(err, json) { 
		//res.send(JSON.parse(json));
		if(err){
			res.end();
		}
		var posts = JSON.parse(json);
		var postCollection = [];
		var totalPosts = ( parseInt(req.params.posts) ) ? parseInt(req.params.posts) : posts.length;
		for (var i=0, last = totalPosts; i<last; i++){
			postCollection.push(posts[i]);
		}
		res.render('modules/ultimos-posts',{'posts':postCollection});
	});
}

exports.mas_iniciativas = function(req, res){
	request( APIUrl+'/diputados?q={"activo":1}&limit=10&order={"actividad.iniciativas.total":-1}', function(error, response, body) {
	  res.render('modules/diputados',{'diputados':JSON.parse(body)}); 
	});
}
exports.menos_iniciativas = function(req, res){
	request( APIUrl+'/diputados?q={"activo":1}&limit=10&order={"actividad.iniciativas.total":1}', function(error, response, body) {
	  res.render('modules/diputados',{'diputados':JSON.parse(body)}); 
	});
}
exports.diputado_web_tags = function(req, res){
	request( APIUrl+'/diputado/'+req.params.id, function(error, response, body) {
		var data = JSON.parse(body);
		var dipURL = _String.slugify(data.nombre+' '+ data.apellidos);
		rsj.r2j( BLOGUrl+'/tag/'+dipURL+'/feed/', function(err, json) { 
			//res.send(JSON.parse(json));
			if(err){ res.end();	}
			res.render('modules/diputado-tags',{'tags':JSON.parse(json)});
		}); 
	});
}
exports.diputado_bienes = function(req, res){
	request( APIUrl+'/diputado/'+req.params.id+'/bienes?order={"tipo":1,"tipoBIU":1,"concepto":1}', function(error, response, body) {
	  var grouped = _.groupBy(JSON.parse(body), function(bien){ return bien.tipo; });
	  res.render('modules/diputado-bienes',{'bienes':grouped}); 
	});
}
exports.diputado_actividad = function(req, res){
	request( APIUrl+'/diputado/'+req.params.id+'?only=["actividad","id","nombre","apellidos"]', function(error, response, body) {
		var respData = JSON.parse(body);
	  	res.render('modules/diputado-actividad-parlamentaria',{
	  		'actividad':respData.actividad[0],
	  		'diputado':{
	  			id: respData.id,
	  			nombre: respData.nombre,
	  			apellidos: respData.apellidos
	  		}
	  	}); 
	});
}

exports.diputado_vida_laboral = function(req, res){
	request( APIUrl+'/diputado/'+req.params.id+'?only=["trayectoria","legislaturas","estudios","cargos_partido","cargos_gobierno","id","nombre","apellidos"]', function(error, response, body) {
	  var respData = JSON.parse(body);
	  	res.render('modules/diputado-vida-laboral',{
			'estudios':respData.estudios,
	  		'trayectoria':respData.trayectoria,
			'cargos_partido':respData.cargos_partido,
			'cargos_gobierno':respData.cargos_gobierno,
			'legislaturas':respData.legislaturas,
	  		'diputado':{
	  			id: respData.id,
	  			nombre: respData.nombre,
	  			apellidos: respData.apellidos
	  		}
	  	}); 
	});
}

exports.diputado_cargos_congreso = function(req, res){
	request( APIUrl+'/diputado/'+req.params.id+'?q={"cargos_congreso.baja":{"$exists":true}}&only=["cargos_congreso","id","nombre","apellidos","sexo"]', function(error, response, body) {
	    request( APIUrl+'/diputados?q={"id":'+req.params.id+',"cargos_congreso.baja" :{"$exists":false}}&only=["cargos_congreso"]', function(error2, response2, body2) {
		request( APIUrl+'/organos', function(error3, response3, body3) { 
			var respData = JSON.parse(body); 
			var respData2 = JSON.parse(body2);
			var respData3 = JSON.parse(body3);
	  		res.render('modules/diputado-cargos-congreso',{
				'cargos_act':respData.cargos_congreso,
				'cargos_hist':respData2.cargos_congreso,
	  			'organos':respData3,
	  			'diputado':{
	  				id: respData.id,
	  				nombre: respData.nombre,
	  				apellidos: respData.apellidos,
					sexo:respData.sexo
	  			}
	  		});
		});
	    });
	});
}

exports.diputado_salario = function(req, res){
        request( APIUrl+'/diputado/'+req.params.id+'?only=["sueldo","url_nomina","id","nombre","apellidos"]', function(error, response, body) {
          var respData = JSON.parse(body);
                res.render('modules/diputado-salario',{
                        'salario':respData.sueldo,
                        'url_nomina':respData.url_nomina,
                        'diputado':{
                                id: respData.id,
                                nombre: respData.nombre,
                                apellidos: respData.apellidos
                        }
                });
        });
}


exports.diputado_votaciones = function(req, res){
	request( APIUrl+'/diputado/'+req.params.id+'/votaciones?limit=2', function(error, response, body) {
		//console.log(JSON.parse(body));
	  res.render('modules/diputado-votaciones',{'votaciones':JSON.parse(body)}); 
	});
}
exports.diputados = function(req, res){
	request( APIUrl+'/diputados', function(error, response, body) {
	  res.render('modules/diputados',{'diputados':JSON.parse(body)}); 
	});
}
exports.diputados_circunscripcion = function(req, res){
	request( APIUrl+'/circunscripcion/'+req.params.id+'/diputados', function(error, response, body) {
	  res.render('modules/diputados',{'diputados':JSON.parse(body)}); 
	});
}
exports.organos_list = function(req, res){
	request( APIUrl+'/organos', function(error, response, body) {
	  res.render('modules/organosList',{'organos':JSON.parse(body), 'active':req.query.active }); 
	});
}

exports.grupos_list = function(req, res){
	request( APIUrl+'/grupos', function(error, response, body) {
	  res.render('modules/gruposList',{'grupos':JSON.parse(body), 'active':req.query.active }); 
	});
}

exports.diputados_grupo = function(req, res){
	request( APIUrl+'/grupo/'+req.params.id+'/diputados', function(error, response, body) {
	  res.render('modules/diputadosGP',{'diputados':JSON.parse(body)}); 
	});
}
exports.iniciativas_grupo = function(req, res){
	request( APIUrl+'/grupo/'+req.params.id+'/iniciativas?limit='+req.params.limit, function(error, response, body) {
	  res.render('modules/iniciativas',{'iniciativas':JSON.parse(body)}); 
	});
}
exports.formaciones_grupo = function(req, res){
  
  var formaciones = req.query.formaciones.split(',');
  
  function arrayString(arr){
  	var r = [];
  	arr.forEach( function(i){
  		r.push('"'+ i +'"');
  	});
  	return r.toString();
  }
  
  request( APIUrl+'/formaciones?q={"nombre":{"$in":['+ arrayString(formaciones) +']}}', function(error, response, body) {
  	res.render('modules/grupo-formaciones',{'formaciones':JSON.parse(body)}); 
  });
}


exports.diputados_organo = function(req, res){
    request( APIUrl+'/diputados?q={"cargos_congreso.idOrgano":'+req.params.id+'}&only=["id","nombre","apellidos","grupo","sexo","cargos_congreso","partido","normalized"]', function(error, response, body) {
        res.render('modules/diputadosOrg',{'diputados':JSON.parse(body),"idorgano":req.params.id});
    });
}
