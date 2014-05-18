var request = require('request');
var async = require('async');
var APIUrl = 'http://localhost:3002';

/*
 * GET home page.
 */

exports.index = function(req, res) {
    res.render('index', {
        'pageActive': "portada"
    });
};

/*
 * GET diputados page
 */

exports.diputados = function(req, res) {
    console.log('Diputados');
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "diputados"
    };
    request(APIUrl + '/diputados?only=["id","nombre","apellidos","normalized","grupo","partido"]', function(error, response, body) {
        request(APIUrl + '/grupos?&only=["nombre"]', function(error2, response2, body2) {
            request(APIUrl + '/circunscripciones?only=["nombre"]', function(error3, response3, body3) {
                viewObject.diputados = JSON.parse(body);
                viewObject.grupos = JSON.parse(body2);
                viewObject.circunscripciones = JSON.parse(body3);
                res.render('diputados', viewObject);
            });
        });
    });
};

exports.exdiputados = function(req, res) {
    console.log('Exdiputados');
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "diputados"
    };
    request(APIUrl + '/diputados?q={"activo":0}&only=["id","nombre","apellidos","normalized","grupo","partido","fecha_baja"]', function(error, response, body) {
        viewObject.diputados = JSON.parse(body);
        res.render('exdiputados', viewObject);
    });
};

exports.diputado = function(req, res) {
    console.log('Diputado', req.params);
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "diputados"
    };
    var subPageActive = req.params.tipo || "actividad";

    switch (subPageActive) {
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
    if (!isNaN(req.params.id)) {
        // es por id
        request(APIUrl + '/diputado/' + req.params.id, function(error, response, body) {
            viewObject.diputado = JSON.parse(body);
            res.redirect('/diputado/' + viewObject.diputado.normalized.url);
            //res.render('diputado', viewObject );
        });
    } else {
        // es por url
        request(APIUrl + '/diputados?q={"normalized.url":"' + req.params.id + '"}', function(error, response, body) {
            viewObject.diputado = JSON.parse(body)[0];
            if (viewObject.diputado.id_sustituto || viewObject.diputado.id_sustituido) {
                if (viewObject.diputado.id_sustituto && viewObject.diputado.id_sustituido) {
                    request(APIUrl + '/diputado/' + viewObject.diputado.id_sustituto, function(error, response, body2) {
                        request(APIUrl + '/diputado/' + viewObject.diputado.id_sustituido, function(error, response, body3) {
                            viewObject.diputado.diputado_sustituto = JSON.parse(body2);
                            viewObject.diputado.diputado_sustituido = JSON.parse(body3);
                            renderView(viewObject);
                        });
                    });
                } else if (viewObject.diputado.id_sustituto) {
                    request(APIUrl + '/diputado/' + viewObject.diputado.id_sustituto, function(error, response, body4) {
                        viewObject.diputado.diputado_sustituto = JSON.parse(body4);
                        renderView(viewObject);
                    });
                } else {
                    request(APIUrl + '/diputado/' + viewObject.diputado.id_sustituido, function(error, response, body5) {
                        viewObject.diputado.diputado_sustituido = JSON.parse(body5);
                        renderView(viewObject);
                    });
                }
            } else {
                renderView(viewObject);
            }
            //res.render('diputado',viewObject);
        });

    }

    function renderView(result) {
        res.render('diputado', result);
    }
};

/*function renderView(result){
    res.render('diputado', result );
  }*/

exports.grupos = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "grupos"
    };
    /* Descomentar cuando haya una portada de grupos parlamentarios
    request( APIUrl+"/grupos", function(error, response, body) {
    viewObject.grupos = JSON.parse(body);
    res.render('gruposParlamentarios', viewObject ); 
  });*/
    request(APIUrl + '/grupos?q={"nombre":"Popular"}', function(error, response, body) {
        viewObject.grupo = JSON.parse(body)[0];
        res.render('grupoParlamentario', viewObject);
    });
};

exports.grupo = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "grupos"
    };
    if (!isNaN(req.params.id)) {
        // es por id
        request(APIUrl + "/grupo/" + req.params.id, function(error, response, body) {
            viewObject.grupo = JSON.parse(body);
            res.render('grupoParlamentario', viewObject);
        });
    } else {
        // es por nombre
        request(APIUrl + '/grupos?q={"nombre":"' + req.params.id + '"}', function(error, response, body) {
            viewObject.grupo = JSON.parse(body)[0];
            res.render('grupoParlamentario', viewObject);
        });
    }
};

exports.votaciones = function(req, res) {
    var pageCount = 10;
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "votaciones"
    };
    request(APIUrl + '/votaciones?count=1&limit=' + pageCount + '&skip=' + (pageCount * (req.params.page || 0)), function(error, response, body) {
        var resultBody = JSON.parse(body)
        viewObject.votaciones = resultBody.result;
        viewObject.totalVotaciones = resultBody.totalObjects;
        viewObject.currentPage = req.params.page;

        res.render('votaciones', viewObject);
    });
};

exports.votacion = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "votaciones"
    };
    request(APIUrl + '/votacion/' + req.params.sesion + '/' + req.params.votacion, function(error, response, body) {
        viewObject.votacion = JSON.parse(body)[0];
        res.render('votacion', viewObject);
    });
}

exports.circunscripciones = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "circunscripciones"
    };
    request(APIUrl + "/circunscripciones", function(error, response, body) {
        viewObject.circunscripciones = JSON.parse(body);
        res.render('circunscripciones', viewObject);
    });
};

exports.circunscripcion = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "circunscripciones"
    };
    if (!isNaN(req.params.id)) {
        // es por id
        request(APIUrl + "/circunscripcion/" + req.params.id, function(error, response, body) {
            viewObject.circunscripcion = JSON.parse(body);
            res.render('circunscripcion', viewObject);
        });
    } else {
        // es por nombre
        request(APIUrl + '/circunscripciones?q={"normalized.url":"' + req.params.id + '"}', function(error, response, body) {
            viewObject.circunscripcion = JSON.parse(body)[0];
            res.render('circunscripcion', viewObject);
        });
    }

};

exports.circunscripcion = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "circunscripciones"
    };
    if (!isNaN(req.params.id)) {
        // es por id
        request(APIUrl + "/circunscripcion/" + req.params.id, function(error, response, body) {
            viewObject.circunscripcion = JSON.parse(body);
            res.render('circunscripcion', viewObject);
        });
    } else {
        // es por nombre
        request(APIUrl + '/circunscripciones?q={"normalized.url":"' + req.params.id + '"}', function(error, response, body) {
            viewObject.circunscripcion = JSON.parse(body)[0];
            res.render('circunscripcion', viewObject);
        });
    }

};

exports.organos = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "organos"
    };
    var ahora = parseInt(Date.now() / 1000);
    request(APIUrl + '/organos?q={"normalized.url":"mesa-del-congreso"}', function(error, response, body) {
        request(APIUrl + '/organos', function(error2, response2, body2) {
            var organo = JSON.parse(body)[0];
            var idorg = organo.id;
            request(APIUrl + '/diputados?q={"cargos_congreso.idOrgano":' + idorg + '}&only=["id","nombre","apellidos","grupo","sexo","cargos_congreso"]', function(error3, response3, body3) {
                request(APIUrl + '/eventos?q={"organo.id":' + idorg + ',"fechahorats":{"$gte":' + ahora + '}}&order={"fechahorats":1}&limit=5', function(error4, response4, body4) {
                    request(APIUrl + '/eventos?q={"organo.id":' + idorg + ',"fechahorats":{"$lt":' + ahora + '}}&order={"fechahorats":-1}&limit=5', function(error5, response5, body5) {
                        viewObject.organo = JSON.parse(body)[0];
                        viewObject.organos = JSON.parse(body2);
                        viewObject.diputados = JSON.parse(body3);
                        viewObject.proximos = JSON.parse(body4);
                        viewObject.siguientes = JSON.parse(body5);
                        res.render('organo', viewObject);
                    });
                });
            });
        });
    });
};

exports.organo = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "organos"
    };
    //var ahora=parseInt(Date.now()/1000);
    var ahora = new Date(Date.now()).toISOString();
    if (!isNaN(req.params.id)) {
        // es por id
        request(APIUrl + '/organos?q={"id":' + req.params.id + '}', function(error, response, body) {
            request(APIUrl + '/organos', function(error2, response2, body2) {
                request(APIUrl + '/diputados?q={"cargos_congreso.idOrgano":' + req.params.id + '}&only=["id","nombre","apellidos","grupo","sexo","cargos_congreso"]', function(error3, response3, body3) {
                    request(APIUrl + '/eventos?q={"organo.id":' + req.params.id + ',"fechahoraJS":{"$gte":"' + ahora + '"}}&order={"fechahoraJS":1}&limit=5', function(error4, response4, body4) {
                        request(APIUrl + '/eventos?q={"organo.id":' + req.params.id + ',"fechahoraJS":{"$lt":"' + ahora + '"}}&order={"fechahoraJS":-1}&limit=5', function(error5, response5, body5) {
                            viewObject.organo = JSON.parse(body)[0];
                            viewObject.organos = JSON.parse(body2);
                            viewObject.diputados = JSON.parse(body3);
                            viewObject.proximos = JSON.parse(body4);
                            viewObject.siguientes = JSON.parse(body5);
                            res.render('organo', viewObject);
                        });
                    });
                });
            });
        });
    } else {
        // es por url
        request(APIUrl + '/organos?q={"normalized.url":"' + req.params.id + '"}', function(error, response, body) {
            request(APIUrl + '/organos', function(error2, response2, body2) {
                var organo = JSON.parse(body)[0];
                var idorg = organo.id;
                request(APIUrl + '/diputados?q={"cargos_congreso.idOrgano":' + idorg + '}&only=["id","nombre","apellidos","grupo","sexo","cargos_congreso"]', function(error3, response3, body3) {
                    request(APIUrl + '/eventos?q={"organo.id":' + idorg + ',"fechahoraJS":{"$gte":"' + ahora + '"}}&order={"fechahoraJS":1}&limit=5', function(error4, response4, body4) {
                        request(APIUrl + '/eventos?q={"organo.id":' + idorg + ',"fechahoraJS":{"$lt":"' + ahora + '"}}&order={"fechahoraJS":-1}&limit=5', function(error5, response5, body5) {
                            viewObject.organo = JSON.parse(body)[0];
                            viewObject.organos = JSON.parse(body2);
                            viewObject.diputados = JSON.parse(body3);
                            viewObject.proximos = JSON.parse(body4);
                            viewObject.siguientes = JSON.parse(body5);
                            res.render('organo', viewObject);
                        });
                    });
                });
            });
        });
    }
};


exports.comisiones = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "organos"
    };
    request(APIUrl + '/organos?q={"tipo":"^C"}&order={"nombre":1}', function(error, response, body) {
        viewObject.comisiones = JSON.parse(body);
        res.render('comisiones', viewObject);
    });
};

exports.subcomisiones = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "organos"
    };
    request(APIUrl + '/organos?q={"tipo":"^S"}&order={"nombre":1}', function(error, response, body) {
        viewObject.subcomisiones = JSON.parse(body);
        res.render('subcomisiones', viewObject);
    });
};

exports.iniciativas = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "iniciativas"
    };
    request(APIUrl + '/iniciativas?limit=30&order={"presentadoJS2":"-1"}&count=1', function(error, response, body) {
        request(APIUrl + '/diputados?q={"activo":{"$in":[0,1]}}&only=["id","nombre","apellidos"]', function(error2, response2, body2) {
            request(APIUrl + '/grupos?only=["nombre","id"]', function(error3, response3, body3) {
                viewObject.iniciativas = JSON.parse(body).result;
                viewObject.numIniciativas = parseInt(JSON.parse(body).totalObjects);
                viewObject.diputados = JSON.parse(body2);
                viewObject.grupos = JSON.parse(body3);
                res.render('iniciativas', viewObject);
            });
        });
    });
}

exports.iniciativas_ = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "iniciativas"
    };
    request(APIUrl + '/iniciativas?limit=30&order={"presentadoJS2":"-1"}&count=1', function(error, response, body) {
        request(APIUrl + '/diputados?q={"activo":{"$in":[0,1]}}&only=["id","nombre","apellidos"]', function(error2, response2, body2) {
            request(APIUrl + '/grupos?only=["nombre","id"]', function(error3, response3, body3) {
                viewObject.iniciativas = JSON.parse(body).result;
                viewObject.numIniciativas = parseInt(JSON.parse(body).totalObjects);
                viewObject.diputados = JSON.parse(body2);
                viewObject.grupos = JSON.parse(body3);
                res.render('iniciativas_', viewObject);
            });
        });
    });
}

exports.intervenciones = function(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "intervenciones"
    };
    request(APIUrl + '/intervenciones?limit=30&order={"fechahora":"-1"}&count=1', function(error, response, body) {
        request(APIUrl + '/diputados?q={"activo":{"$in":[0,1]}}&only=["id","nombre","apellidos"]', function(error2, response2, body2) {
            request(APIUrl + '/organos?q={"tipo":"^C"}&only=["pre","nombre","id"]', function(error3, response3, body3) {
                viewObject.intervenciones = JSON.parse(body).result;
                viewObject.numIntervenciones = parseInt(JSON.parse(body).totalObjects);
                viewObject.diputados = JSON.parse(body2);
                viewObject.comisiones = JSON.parse(body3);
                res.render('intervenciones', viewObject);
            });
        });
    });
}

/*
 * GET nosotros page.
 */

exports.nosotros = function(req, res) {
    res.render('nosotros', {
        'pageActive': "quienesSomos"
    });
};
exports.donde_encontrarnos = function(req, res) {
    res.render('donde-encontrarnos', {
        'pageActive': "donde-encontrarnos"
    });
};
exports.como_nos_financiamos = function(req, res) {
    res.render('financiacion', {
        'pageActive': "como-nos-financiamos"
    });
};
exports.agradecimientos = function(req, res) {
    res.render('agradecimientos', {
        'pageActive': "agradecimientos"
    });
};
exports.condiciones_uso = function(req, res) {
    res.render('condicionesUso', {
        'pageActive': "condiciones-uso"
    });
};
exports.politica_privacidad = function(req, res) {
    res.render('privacidad', {
        'pageActive': "politica-privacidad"
    });
};
exports.agenda = function(req, res) {
    res.render('agenda', {
        'pageActive': "agenda"
    });
};



/* GET AYUDA page */
exports.sigue_diputado = function(req, res) {
    res.render('sigue-diputado', {
        'pageActive': "sigue-diputado"
    });
};

exports.colaboradores = function(req, res) {
    res.render('colaboradores', {
        'pageActive': "colaboradores"
    });
};


exports.mas_informacion_diputados = function(req, res) {
    res.render('mas-informacion-diputados', {
        'pageActive': "mas-informacion-diputados"
    });
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