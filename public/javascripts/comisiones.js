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
	var srcImg="http://www.movidamovil.com/descargas/images/cmobile/loading.gif";
        var img="<img src='"+srcImg+"' alt='cargando contenido'/>";
        var div="<div style='min-height:400px;padding:50px 200px;width:100%'><p style='text-align:center'>"+img+"</p></div>";
	$('.containerComisiones').html(div);
});

function templateComisiones(sel){
	// Cabecera de la tabla
	var template = '<table><tbody><tr>';
        var hrefs= ["nombre","numDipus","fechaConst","legislativa","permanente","mixta"];  
        var titulos= ["Nombre","Nº diputados","Fecha constitución","Legislativa","Permanente","Mixta"];
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

        for(var i=0;i<6;i++){
                if(hrefs[i]==sel){
                        template+='<th id="'+hrefs[i]+'col"><a class="'+claseSel+'" style="text-decoration:underline" href="#'+hrefSel+'">'+titulos[i]+'</a> <i style="color:#FE5339;" class="'+iconSel+'"></i></th>';
                }else{
                        template+='<th id="'+hrefs[i]+'col"><a href="#'+hrefs[i]+'">'+titulos[i]+'</a></th>';
                }
        }
	template+='</tr>';
	
	
	//Fila de cada comisión
	template+='{{#data}}<tr><td><a href="/organo/{{normalized.url}}">{{nombre}}</a></td><td>{{numDiputados}}</td><td>{{constituida}}</td><td>{{legistxt}}</td><td>{{permtxt}}</td><td>{{mixtatxt}}</td></tr>{{/data}} </tbody></table>';
	return template;
}

$(function(){
	var Router = Backbone.Router.extend({
		comisiones: null,
		listo:null,
		initialize: function(){
			$.when(
				$.ajax('http://api.quehacenlosdiputados.net/organos?q={"tipo":"^C"}&order:{"nombre":1}'),
				$.ajax('http://api.quehacenlosdiputados.net/diputados?q={"cargos_congreso.tipoOrgano":"^C"}&only:["cargos_congreso"}')
			).done(function(_data,_data2){
				// Añadimos campos que harán falta	
				comisiones=_data[0];
				_.each(comisiones,function(com){
					com.nombre=mayusFirst(com.nombre);
					if(com.legis==1){ com.legistxt="Sí";
					}else{ com.legistxt="No";}

					if(com.perm==1){ com.permtxt="Sí";}
					else{ com.permtxt="No";}
				
					if(com.mixta==1){ com.mixtatxt="Sí";
					}else{ com.mixtatxt="No";}
                        	});

				// Añadimos nº de diputados
				_.each(comisiones,function(com){
					var num=0;
                   			_.each(_data2[0],function(dipu){
						var tiene=false;
						_.each(dipu.cargos_congreso, function(cargo){
							//mejorar: con break
							if (cargo.idOrgano == com.id && typeof(cargo.baja) == "undefined"){
                       						tiene=true;
                    					}
						});
						if(tiene==true) num++;
					});
					com.numDiputados=num;
              			});
			}).done(function(){
				listo=1;
				//alert('ponemos listo a true');
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
			'fechaConstR':'fechaConstHandler'
		},

		nombreHandler: function(){
			if(!this.listo){
				setTimeout(this.nombreHandler, 1000);
				return;
			}
			var datos=[];
			datos.data= _.sortBy(this.comisiones, function(com){ return com.nombre; });
			if(Backbone.history.fragment == "nombreR"){
				datos.data.reverse();
			}
			var template = templateComisiones('nombre');
			$('.containerComisiones').html( Mustache.render(template, datos) );
		},

		legislativaHandler: function(){
			if(this.listo!=1){
				console.log('reiniciamos');
				setTimeout(this.legislativaHandler, 1000);
				return 0;
			}

			var dataFiltered = _.groupBy(this.comisiones, function(comision){
				return (comision.legis)?'legis':'nolegis'
			});
			var datos=[];
			datos.data=_.union(dataFiltered['legis'],dataFiltered['nolegis']);
			if(Backbone.history.fragment == "legislativaR"){
				datos.data.reverse();
			}
			var template = templateComisiones('legislativa');
			$('.containerComisiones').html( Mustache.render(template, datos) );
		},

		mixtaHandler: function(){
			console.log('mixta');
			if(!this.listo){
				setTimeout(this.mixtaHandler, 1000);
				return;
			}

			var dataFiltered = _.groupBy(this.comisiones, function(comision){
				return (comision.mixta)?'mixta':'nomixta'
			});
			var datos=[];
			datos.data=_.union(dataFiltered['mixta'],dataFiltered['nomixta']);
			if(Backbone.history.fragment == "mixtaR"){
				datos.data.reverse();
			}
			var template = templateComisiones('mixta');
			$('.containerComisiones').html( Mustache.render(template, datos) );
		},

		permanenteHandler: function(){
			console.log('permanente');
			if(!this.listo){
				setTimeout(this.permanenteHandler, 1000);
				return;
			}

			var dataFiltered = _.groupBy(this.comisiones, function(comision){
				return (comision.perm)?'perm':'noperm'
			});
			var datos=[];
			datos.data=_.union(dataFiltered['perm'],dataFiltered['noperm']);
			if(Backbone.history.fragment == "permanenteR"){
				datos.data.reverse();
			}
			var template = templateComisiones('permanente');
			$('.containerComisiones').html( Mustache.render(template, datos) );
		},
		
		numDipusHandler: function(){
			if(!this.listo){
				setTimeout(this.numDipusHandler,1000);
				return;
			}
			var datos = [];
			datos.data=_.sortBy(this.comisiones, function(com){ return com.numDiputados; });
			if(Backbone.history.fragment == "numDipusR"){
				datos.data.reverse();
			}
			console.log(datos.data);
			var template = templateComisiones('numDipus');
			$('.containerComisiones').html( Mustache.render(template, datos) );
		},

		fechaConstHandler:function(){	
			if(!this.listo){
				setTimeout(this.fechaConstHandler,1000);
				return;
			}
		
			var datos=[];
			datos.data=_.sortBy(this.comisiones, function(com){
				var nums=com.constituida.split('/');
				var fecha= new Date(nums[2],nums[1],nums[0]);  
				var time=fecha.getTime();
				return time;
			});
			if(Backbone.history.fragment == "fechaConstR"){
				datos.data.reverse();
			}

			var template = templateComisiones('fechaConst');
			$('.containerComisiones').html( Mustache.render(template, datos) );
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
