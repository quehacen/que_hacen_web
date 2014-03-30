
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , modules = require('./routes/modules')
  , http = require('http')
  , path = require('path')
  , consolidate = require('consolidate')
  , swig = require('swig')
  , filters = require('./swig_filters')(swig);

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  /** SWIG Config **/
  app.engine('html', consolidate.swig);
  app.set('view engine', 'html');
  app.set('views', __dirname + '/views');
  app.set('view options', { layout: false });
  app.set('view cache', false);
  /** **/
  app.use(express.favicon());
  app.use(express.logger('dev'));
  //app.use(express.bodyParser());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(function(req, res, next){
    if (res.status(404)) {
      res.redirect('/404');
      return;
    }
    next();
  });

});

swig.setDefaults({ cache: false });

/*
app.use(function(req, res, next){
  // the status option, or res.statusCode = 404
  // are equivalent, however with the option we
  // get the "status" local available as well
  res.render('404', { status: 404, url: req.url });
});
*/

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/blog', routes.index );
app.get('/diputados', routes.diputados);
app.get('/diputado/:id', routes.diputado);
app.get('/diputado/:id/:tipo', routes.diputado);
app.get('/grupos-parlamentarios', routes.grupos);
app.get('/grupo-parlamentario/:id', routes.grupo);
app.get('/votaciones', routes.votaciones);
app.get('/circunscripciones', routes.circunscripciones);
app.get('/circunscripcion/:id', routes.circunscripcion);
app.get('/organos', routes.organos);
app.get('/organo/:id', routes.organo);
app.get('/comisiones', routes.comisiones);
app.get('/subcomisiones', routes.subcomisiones);

/** nosotros **/
app.get('/quienes-somos', routes.nosotros);
app.get('/financiacion', routes.como_nos_financiamos);
app.get('/agradecimientos', routes.agradecimientos);
app.get('/politica-privacidad', routes.politica_privacidad);
app.get('/condiciones-uso', routes.condiciones_uso);
app.get('/donde-encontrarnos', routes.donde_encontrarnos);
app.get('/agenda', routes.agenda);

/** ayuda **/
app.get('/sigue-diputado', routes.sigue_diputado);
app.get('/colaboradores', routes.colaboradores);
app.get('/mas-informacion-diputados', routes.mas_informacion_diputados);

/*** notFound **************************************************************/
app.get('/404', function(req, res){
  res.render('404', { url: req.url });
});

/*** Modules **************************************************************/
app.get('/modules/portada/ultimos-posts/:posts', modules.ultimos_posts);
app.get('/modules/portada/ultimas-iniciativas/:limit', modules.ultimas_iniciativas);
app.get('/modules/portada/ultimas-votaciones/:limit', modules.ultimas_votaciones);
app.get('/modules/portada/actividad/mas-iniciativas/:limit', modules.mas_iniciativas);
app.get('/modules/portada/actividad/menos-iniciativas/:limit', modules.menos_iniciativas);
app.get('/modules/diputados', modules.diputados);
app.get('/modules/diputado/:id/tags', modules.diputado_web_tags);
app.get('/modules/diputado/:id/bienes', modules.diputado_bienes);
app.get('/modules/diputado/:id/actividad', modules.diputado_actividad);
app.get('/modules/diputado/:id/vida-laboral', modules.diputado_vida_laboral);
app.get('/modules/diputado/:id/cargos-congreso', modules.diputado_cargos_congreso);
app.get('/modules/diputado/:id/salario', modules.diputado_salario);
app.get('/modules/diputado/:id/votaciones', modules.diputado_votaciones);
app.get('/modules/circunscripcion/:id/diputados', modules.diputados_circunscripcion);
app.get('/modules/grupos/list', modules.grupos_list);
app.get('/modules/grupo/:id/diputados', modules.diputados_grupo);
app.get('/modules/grupo/:id/iniciativas/:limit', modules.iniciativas_grupo);
app.get('/modules/formaciones',modules.formaciones_grupo);
app.get('/modules/organo/:id/diputados',modules.diputados_organo);
app.get('/modules/organos/list',modules.organos_list);

/*function(req,res){
  GrupoDAO.listado(function( result ){
    res.render('modules/gruposList',{
      'grupos':result,
      'active':req.query.active
    });
  });
});
/*** ******************************************************************** **/


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'), process.env.PORT);
});
