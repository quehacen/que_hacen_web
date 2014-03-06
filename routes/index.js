var request = require('request');
var APIUrl = 'http://localhost:3002';

/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index',{'pageActive':"portada"}); 
};

/*
 * GET diputados page
 */

exports.diputados = function(req, res){
	console.log('Diputados');
	var viewObject = {'pageActive':"diputados"};
  request( APIUrl+'/diputados?q={"activo":1}&only=["id","nombre","apellidos","normalized","grupo","partido"]', function(error, response, body) {
    viewObject.diputados = JSON.parse(body);
    res.render('diputados', viewObject ); 
  });
};

exports.diputado = function(req, res){
  console.log('Diputado', req.params);
  var viewObject = {'pageActive':"diputados"};
  var subPageActive = req.params.tipo || "actividad";
  
  switch(subPageActive) {
    case 'actividad': 
      viewObject.subPageActive = 'actividad';
    break;
    case 'vida-laboral': 
      viewObject.subPageActive = 'vida-laboral';
    break;
    case 'cargos-congreso': 
      viewObject.subPageActive = 'cargos-congreso';
    break;
    case 'declaracion-de-bienes': 
      viewObject.subPageActive = 'declaracion-de-bienes';
    break;
    case 'salario': 
      viewObject.subPageActive = 'salario';
    break;
    default:
      viewObject.subPageActive = 'actividad';
  }
  //console.log(APIUrl+'/diputados?q={"normalized.url":"'+req.params.id+'"}');
  if( !isNaN(req.params.id) ){
    // es por id
    request( APIUrl+'/diputado/'+req.params.id, function(error, response, body) {
      viewObject.diputado = JSON.parse(body);
      res.render('diputado', viewObject );
    });
  } else {
    // es por url
    request( APIUrl+'/diputados?q={"normalized.url":"'+req.params.id+'"}', function(error, response, body) {
      viewObject.diputado = JSON.parse(body)[0];
      res.render('diputado', viewObject );
    });
  }

};

exports.grupos = function(req, res){
  var viewObject = {'pageActive':"grupos"};
  /* Descomentar cuando haya una portada de grupos parlamentarios
    request( APIUrl+"/grupos", function(error, response, body) {
    viewObject.grupos = JSON.parse(body);
    res.render('gruposParlamentarios', viewObject ); 
  });*/
    request( APIUrl+'/grupos?q={"nombre":"Popular"}', function(error, response, body) {
       viewObject.grupo = JSON.parse(body)[0];
       res.render('grupoParlamentario', viewObject );
   });
};

exports.grupo = function(req, res){
  var viewObject = {'pageActive':"grupos"};
  if( !isNaN(req.params.id) ){
    // es por id
    request( APIUrl+"/grupo/"+req.params.id, function(error, response, body) {
      viewObject.grupo = JSON.parse(body);
      res.render('grupoParlamentario', viewObject ); 
    });
  } else {
    // es por nombre
    request( APIUrl+'/grupos?q={"nombre":"'+req.params.id+'"}', function(error, response, body) {
      viewObject.grupo = JSON.parse(body)[0];
      res.render('grupoParlamentario', viewObject ); 
    });
  }
  
};

exports.circunscripciones = function(req, res){
  var viewObject = {'pageActive':"circunscripciones"};
  request( APIUrl+"/circunscripciones", function(error, response, body) {
    viewObject.circunscripciones = JSON.parse(body);
    res.render('circunscripciones', viewObject ); 
  });
};

exports.circunscripcion = function(req, res){
  var viewObject = {'pageActive':"circunscripciones"};
  if( !isNaN(req.params.id) ){
    // es por id
    request( APIUrl+"/circunscripcion/"+req.params.id, function(error, response, body) {
      viewObject.circunscripcion = JSON.parse(body);
      res.render('circunscripcion', viewObject ); 
    });
  } else {
    // es por nombre
    request( APIUrl+'/circunscripciones?q={"normalized.url":"'+req.params.id+'"}', function(error, response, body) {
      viewObject.circunscripcion = JSON.parse(body)[0];
      res.render('circunscripcion', viewObject ); 
    });
  }
  
};

exports.circunscripcion = function(req, res){
  var viewObject = {'pageActive':"circunscripciones"};
  if( !isNaN(req.params.id) ){
    // es por id
    request( APIUrl+"/circunscripcion/"+req.params.id, function(error, response, body) {
      viewObject.circunscripcion = JSON.parse(body);
      res.render('circunscripcion', viewObject ); 
    });
  } else {
    // es por nombre
    request( APIUrl+'/circunscripciones?q={"normalized.url":"'+req.params.id+'"}', function(error, response, body) {
      viewObject.circunscripcion = JSON.parse(body)[0];
      res.render('circunscripcion', viewObject ); 
    });
  }
  
};

exports.organos= function(req, res){
  var viewObject = {'pageActive':"organos"};
    request( APIUrl+'/organos?q={"normalized.url":"mesa-del-congreso"}', function(error, response, body) {
     request( APIUrl+'/organos', function(error2, response2, body2) {
	var organo=JSON.parse(body)[0];
	var idorg=organo.id;
	console.log('IDOrg:'+idorg);
        request( APIUrl+'/diputados?q={"cargos_congreso.idOrgano":'+idorg+'}&only=["id","nombre","apellidos","grupo","sexo","cargos_congreso"]', function(error3, response3, body3) {
    	   viewObject.organo = JSON.parse(body)[0];
	   viewObject.organos= JSON.parse(body2);
    	   viewObject.diputados=JSON.parse(body3);
    	   res.render('organo', viewObject ); 
        });
     });
    });
  /*request( APIUrl+"/organos", function(error, response, body) {
    var organos = JSON.parse(body);
    var orgGen = [];
    var com = [];
    var subcom = [];
    for(var org in organos){
    	if(org.tipo=="JP" || org.tipo=="MC" || org.tipo=="DP"){
    		orgGen[orgGen.lenght]=org;
    	}else if(org.tipo=="C"){
    		com[com.length]=org;
    	}else if(org.tipo=="SC"){
    		subcom[subcom.length]=org;
    	}
    }
    viewObject.orgGen=orgGen; 
    viewObject.com=JSON.parse(com);
    viewObject.subcom=subcom;

    res.render('organos', viewObject ); 
  });*/
};

exports.organo= function(req, res){
  var viewObject = {'pageActive':"organos"};
  if( !isNaN(req.params.id) ){
    // es por id
    request( APIUrl+'/organos?q={"id":'+req.params.id+'}', function(error, response, body) {
     request( APIUrl+'/organos', function(error2, response2, body2) {    
        request( APIUrl+'/diputados?q={"cargos_congreso.idOrgano":'+req.params.id+'}&only=["id","nombre","apellidos","grupo","sexo","cargos_congreso"]', function(error3, response3, body3) {
    	   viewObject.organo = JSON.parse(body)[0];
	   viewObject.organos= JSON.parse(body2);
    	   viewObject.diputados=JSON.parse(body3);
    	   res.render('organo', viewObject ); 
        });
     });
    });
  } else {
    // es por url
    request( APIUrl+'/organos?q={"normalized.url":"'+req.params.id+'"}', function(error, response, body) {
     request( APIUrl+'/organos', function(error2, response2, body2) {
	var organo=JSON.parse(body)[0];
	var idorg=organo.id;
	console.log('IDOrg:'+idorg);
        request( APIUrl+'/diputados?q={"cargos_congreso.idOrgano":'+idorg+'}&only=["id","nombre","apellidos","grupo","sexo","cargos_congreso"]', function(error3, response3, body3) {
    	   viewObject.organo = JSON.parse(body)[0];
	   viewObject.organos= JSON.parse(body2);
    	   viewObject.diputados=JSON.parse(body3);
    	   res.render('organo', viewObject ); 
        });
     });
    });
   }
};


exports.comisiones = function(req, res){
  var viewObject = {'pageActive':"organos"};
    request( APIUrl+'/organos?q={"tipo":"^C"}&order={"nombre":1}', function(error, response, body) {
    viewObject.comisiones = JSON.parse(body);
      res.render('comisiones', viewObject ); 
    });  
};

exports.subcomisiones = function(req, res){
  var viewObject = {'pageActive':"organos"};
    request( APIUrl+'/organos?q={"tipo":"^S"}&order={"nombre":1}', function(error, response, body) {
    viewObject.subcomisiones = JSON.parse(body);
      res.render('subcomisiones', viewObject ); 
    });  
};

/*
 * GET nosotros page.
 */

exports.nosotros = function(req, res){
	res.render('nosotros',{'pageActive':"quienesSomos"}); 
};
exports.donde_encontrarnos = function(req, res){
  res.render('donde-encontrarnos',{'pageActive':"donde-encontrarnos"}); 
};
exports.como_nos_financiamos = function(req, res){
  res.render('financiacion',{'pageActive':"como-nos-financiamos"}); 
};
exports.agradecimientos = function(req, res){
  res.render('agradecimientos',{'pageActive':"agradecimientos"}); 
};
exports.condiciones_uso = function(req, res){
  res.render('condicionesUso',{'pageActive':"condiciones-uso"}); 
};
exports.politica_privacidad = function(req, res){
  res.render('privacidad',{'pageActive':"politica-privacidad"}); 
};
exports.agenda = function(req, res){
  res.render('agenda',{'pageActive':"agenda"}); 
};



/* GET AYUDA page */
exports.sigue_diputado = function(req, res){
  res.render('sigue-diputado',{'pageActive':"sigue-diputado"}); 
};

exports.colaboradores = function(req, res){
  res.render('colaboradores',{'pageActive':"colaboradores"}); 
};


exports.mas_informacion_diputados = function(req, res){
  res.render('mas-informacion-diputados',{'pageActive':"mas-informacion-diputados"}); 
};

/*
function get(_url, _callback){

  var http = require('http');
  http.get(_url, function(response){
    // Variable que guarda los datos
    var responseData = "";

    response.on('data', function(_data){
      responseData += _data;
    });
    response.on('end', function(){
      _callback( responseData );
    });

  });
}*/
