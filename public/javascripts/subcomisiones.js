/*
(function(_){
	_.miFiltro = function(){
		console.log('filtro');
		return 'filtro';
	}
})(_);*/
/*
$(document).ready(function(){
	$("th a").hover(
	function() {
		//alert('entro');
		if($(this).hasClass("sel")==false){
			$( this ).css("text-decoration","underline");
		}else{
			alert('tiene clase sel');
		}
	}, function() {
		if($(this).hasClass("sel")==false)
			$( this ).css("text-decoration","none");
	});
});*/
function mayusFirst(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

$(document).ready(function(){
	$().html('');
	var srcImg="http://www.mo-experts.com/images/loading.gif";
        var img="<img src='"+srcImg+"' alt='cargando contenido'/>";
        var div="<div style='min-height:400px;padding:50px 200px;width:100%'><p style='text-align:center'>"+img+"</p></div>";
	$('.containerSubComisiones').html(div);
});

function templateComisiones(sel){
	// Cabecera de la tabla
	var template = '<table><tbody><tr>';
        var hrefs= ["nombre","fechaConst","numDipus","numSesiones","legislativa","permanente","mixta"];
        var titulos= ["Nombre","Constitución","Diputados","Sesiones","Legislativa","Permanente","Mixta"];
	var claseSel, iconSel;
	
	//if($('#'+sel+'col a').hasClass('sel') ){
	if(Backbone.history.fragment == sel+"R"){
		claseSel="selRev";
		hrefSel=sel;
		iconSel="fa fa-chevron-up";
	}else{
		claseSel="sel";
		hrefSel=sel+'R';
		iconSel="fa fa-chevron-down";
	}

        for(var i=0;i<7;i++){
                if(hrefs[i]==sel){
                        template+='<th id="'+hrefs[i]+'col"><a class="'+claseSel+'" style="text-decoration:underline" href="#'+hrefSel+'">'+titulos[i]+'</a> <i style="color:#FE5339;" class="'+iconSel+'"></i></th>';
                }else{
                        template+='<th id="'+hrefs[i]+'col"><a href="#'+hrefs[i]+'">'+titulos[i]+'</a></th>';
                }
        }
	template+='</tr>';
	
	
	//Fila de cada subcomisión
        template+='{{#data}}<tr><td><a href="/organo/{{normalized.url}}">{{nombre}}</a></td><td>{{constituida}}</td><td>{{n_diputados}}</td><td>{{numSesiones}}</td><td>{{legistxt}}</td><td>{{permtxt}}</td><td>{{mixtatxt}}</td></tr>{{/data}} </tbody></table>';
	return template;
}

$(function(){
	var Router = Backbone.Router.extend({
		subcomisiones: null,
		listo:null,
		initialize: function(){
			$.when(
				$.ajax('http://api.quehacenlosdiputados.net/organos?q={"tipo":"^SC"}&order:{"nombre":1}'),
				$.ajax('http://api.quehacenlosdiputados.net/eventos?q={"organo.tipo":"^SC"}&only=["organo","fecha"]')
			).done(function(_data,_data2){
				// Añadimos campos que harán falta	
				subcomisiones=_data[0];
				_.each(subcomisiones,function(com){
					com.nombre=mayusFirst(com.nombre);
					if(com.legis==1){ com.legistxt="Sí";
					}else{ com.legistxt="No";}

					if(com.perm==1){ com.permtxt="Sí";}
					else{ com.permtxt="No";}
				
					if(com.mixta==1){ com.mixtatxt="Sí";
					}else{ com.mixtatxt="No";}
                        	});

				// Añadimos nº de diputados
				_.each(subcomisiones,function(com){
					var num=0;
                                        var eventos_com = _.filter(_data2[0], function(evento){
                                                return evento.organo.id == com.id; });
                                        var ultimo = _.max(eventos_com, function(evento){
                                                return evento.organo.n_evento; });
                                        com.numSesiones=ultimo.organo.n_evento;
                                        com.ultimaSesion=ultimo.fecha;
              			});
			}).done(function(){
				listo=1;
			});
		},

		routes:{
			'' : 'nombreHandler',
			'nombre' : 'nombreHandler',
			'nombreR' : 'nombreHandler',
			'legislativa': 'legislativaHandler',
			'legislativaR': 'legislativaHandler',
			'mixta': 'mixtaHandler',
			'mixtaR': 'mixtaHandler',
			'permanente': 'permanenteHandler',
			'permanenteR':'permanenteHandler',
			'numDipus':'numDipusHandler',
			'numDipusR':'numDipusHandler',
			'fechaConst':'fechaConstHandler',
			'fechaConstR':'fechaConstHandler',
                        'numSesiones':'numSesionesHandler',
                        'numSesionesR':'numSesionesHandler'
		},

		nombreHandler: function(){
			if(!this.listo){
				setTimeout(this.nombreHandler, 1000);
				return;
			}
			var datos=[];
			datos.data= _.sortBy(this.subcomisiones, function(com){ return com.nombre; });
			if(Backbone.history.fragment == "nombreR"){
				datos.data.reverse();
			}
			var template = templateComisiones('nombre');
			$('.containerSubComisiones').html( Mustache.render(template, datos) );
		},

		legislativaHandler: function(){
			if(this.listo!=1){
				setTimeout(this.legislativaHandler, 1000);
				return 0;
			}

			var dataFiltered = _.groupBy(this.subcomisiones, function(comision){
				return (comision.legis)?'legis':'nolegis'
			});
			var datos=[];
			if(dataFiltered['legis'] && dataFiltered['nolegis']){
				datos.data=_.union(dataFiltered['legis'],dataFiltered['nolegis']);
			}else{
				if(dataFiltered['legis']){
					datos.data=dataFiltered['legis'];
				}else{
					datos.data=dataFiltered['nolegis'];
				}
			}
			if(Backbone.history.fragment == "legislativaR"){
				datos.data.reverse();
			}
			var template = templateComisiones('legislativa');
			$('.containerSubComisiones').html( Mustache.render(template, datos) );
		},

		mixtaHandler: function(){
			console.log('mixta');
			if(!this.listo){
				setTimeout(this.mixtaHandler, 1000);
				return;
			}

			var dataFiltered = _.groupBy(this.subcomisiones, function(comision){
				return (comision.mixta)?'mixta':'nomixta'
			});
			var datos=[];
			if(dataFiltered['mixta'] && dataFiltered['nomixta']){
				datos.data=_.union(dataFiltered['mixta'],dataFiltered['nomixta']);
			}else{
				if(dataFiltered['mixta']){
					datos.data=dataFiltered['mixta'];
				}else{
					datos.data=dataFiltered['nomixta'];
				}
			}
			if(Backbone.history.fragment == "mixtaR"){
				datos.data.reverse();
			}
			var template = templateComisiones('mixta');
			$('.containerSubComisiones').html( Mustache.render(template, datos) );
		},

		permanenteHandler: function(){
			console.log('permanente');
			if(!this.listo){
				setTimeout(this.permanenteHandler, 1000);
				return;
			}

			var dataFiltered = _.groupBy(this.subcomisiones, function(comision){
				return (comision.perm)?'perm':'noperm'
			});
			var datos=[];
			if(dataFiltered['perm'] && dataFiltered['noperm']){
				datos.data=_.union(dataFiltered['perm'],dataFiltered['noperm']);
			}else{
				if(dataFiltered['perm']){
					datos.data=dataFiltered['perm'];
				}else{
					datos.data=dataFiltered['noperm'];
				}
			}
			if(Backbone.history.fragment == "permanenteR"){
				datos.data.reverse();
			}
			var template = templateComisiones('permanente');
			$('.containerSubComisiones').html( Mustache.render(template, datos) );
		},
		
		numDipusHandler: function(){
			if(!this.listo){
				setTimeout(this.numDipusHandler,1000);
				return;
			}
			var datos = [];
			datos.data=_.sortBy(this.subcomisiones, function(com){ return com.n_diputados; });
			if(Backbone.history.fragment == "numDipusR"){
				datos.data.reverse();
			}
			console.log(datos.data);
			var template = templateComisiones('numDipus');
			$('.containerSubComisiones').html( Mustache.render(template, datos) );
		},

		fechaConstHandler:function(){	
			if(!this.listo){
				setTimeout(this.fechaConstHandler,1000);
				return;
			}
		
			var datos=[];
			datos.data=_.sortBy(this.subcomisiones, function(com){
				var nums=com.constituida.split('/');
				var fecha= new Date(nums[2],nums[1],nums[0]);  
				var time=fecha.getTime();
				return time;
			});
			if(Backbone.history.fragment == "fechaConstR"){
				datos.data.reverse();
			}

			var template = templateComisiones('fechaConst');
			$('.containerSubComisiones').html( Mustache.render(template, datos) );
		},

                numSesionesHandler: function(){
                        if(!this.listo){
                                setTimeout(this.numSesionesHandler,1000);
                                return;
                        }
                        var datos = [];
                        datos.data=_.sortBy(this.subcomisiones, function(com){ return com.numSesiones; });
                        if(Backbone.history.fragment == "numSesionesR"){
                                datos.data.reverse();
                        }
                        console.log(datos.data);
                        var template = templateComisiones('numSesiones');
                        $('.containerSubComisiones').html( Mustache.render(template, datos) );
                },

		apiCall: function(col, _data, callback){
			$.ajax({
				url:'http://api.quehacenlosdiputados.net/'+col,
				data : _data
			}).done(function(result){
				callback(result);
			});
		}
	});

	var router = new Router();
	Backbone.history.start();

});
