function edad(fechanac) {
	var date = fechanac;
	var nums = date.split('/');
	var nac= new Date(nums[2],nums[1],nums[0]);
	var hoy=new Date();
	return parseInt((hoy - nac)/365/24/60/60/1000);
}

function toSlug(Text){
    return Text.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
}

function loadingDiv(){
	var ancho=parseInt($(window).width());
	var alto=parseInt($(window).height());
	ancho=ancho-32;
	alto=alto-32;
	var div="<div id='loading' style='position: absolute; left:"+ancho+"px; top:"+alto+";'>";
	div+="<img src='http://www.movidamovil.com/descargas/images/cmobile/loading.gif' alt='cargando contenido'/>";
	//div+="<span>Cargando diputados</span>";
	div+="</div>";
	return div;
}

function templateDipu(sub,subrs){
	//var template='<ol class="diputados">
	var template='{{#data}}<li class="diputado">';
	template+='<a href="/diputado/{{normalized.url}}" title="Ver ficha de {{nombre}} {{apellidos}}">';
	template+='<span class="fotoimg"><img src="/img/imagenesDipus/{{id}}.jpg" alt="Fotografía de {{nombre}} {{apellidos}}"></span>';
	template+='<span class="nombre"><b>{{apellidos}}</b>, {{nombre}}</span><img class="partidoimg" src="/img/miniaturasPartidos/{{partido }}.png" alt="logotipo del partido {{partido}}"></span>';
	template+='</a>';

	var txtrs='';
	if(typeof(subrs) != "undefined" && subrs.length > 0){
		_.each(subrs,function(rs){
			var rsi='';
			var rscolor='';
			switch(rs){
				case 'tw':
					rscolor='#5DD7FC';
					rsi='twitter-square';
					//rsi='twitter';
					break;
				case 'fb':
					rscolor='#3C599B';
					rsi='facebook-square';
					//rsi='facebook';
					break;
			}
			if(rs=="correos"){
				txtrs+='{{#correos}}';
				txtrs+='<a target="_blank" href="mailto:{{.}}"> <i style="color:#B6B6B6" class="fa fa-envelope-o"></i></a>';
				txtrs+='{{/correos}}';
			}else{
				txtrs+='<a target="_blank" href="{{'+rs+'}}"> <i style="color:'+rscolor+'" class="fa fa-'+rsi+'"></i></a> ';
			}
		});
	}

	switch(sub){
		case 'edad': txtsub='{{edad}} años';break;
		case 'sueldo':txtsub='<a href="/diputado/{{normalized.url}}/salario">{{sueldo.bruto_mes}} €/mes</a>';break;	
		case 'inic': txtsub='{{actividad.0.iniciativas.total}} iniciativas';break;
		case 'interv': txtsub='{{actividad.0.intervenciones.total}} intervenciones';break;
		case 'grupo': case '': txtsub='G.P. {{grupo}}';break;
		default: txtsub='G.P. {{grupo}}';break;
	}
	
	if(sub!='' || sub=='' && txtrs=='') 
		template+='<span class="subt">'+txtsub+'</span>';
	if(txtrs!='')	
		template+='<span class="subt subtrs">'+txtrs+'</span>';
	template+='</li>{{/data}}';
	return template;
}

function validParams(order, filter){
	var valido=true;

	if(order!=null){	
		var ordenes=order.split('&');
		_.each(ordenes,function(orden){
			switch(orden){
				case 'edad': case 'salario': case 'nombre': case 'inic': case 'interv': 
					break;
				default:
					valido = false;return;
			}
		});
		if(valido==false) return false;
	}


	if(filter!=null){
		var filtros=filter.split('&');
		// Mejora --> Detectar si se pasan más de un filtro de circunsc o grupo --> no válido
		_.each(filtros,function(filtro){
			var enc;
			// Filtro de grupo
			if(filtro.indexOf('grupo=')==0){
				var gruposf=filtro.substr(6).split('+');
				_.each(gruposf,function(grupof){
					enc = _.find(this.grupos, function(g){ 
						return grupof == toSlug(g.nombre); });
					if(enc == undefined) valido=false;
				});
				//if(enc == undefined){ valido=false; }else{alert('encontrado'); }
				return;
			}

			// Filtro de circunscripcion
			if(filtro.indexOf('circuns=')==0){
				var circunsf=filtro.substr(8).split('+');
				_.each(gruposf,function(grupof){
					enc = _.find(this.circunscripciones, function(c){ 
						return circunsFiltro == c.normalized.url; });
					if(enc == undefined) valido=false;
				});
				return;
			}

			switch(filtro){
				case 'contw': case 'sintw': case 'concorreo': case 'sincorreo': case 'confb': case 'sinfb':
				case 'mujeres': case 'hombres': case 'sininterv': case 'sininic':
					break;
				default:
					valido=false; return;
			}
		});
		if(valido==false) return false;
	}

	return true;
}


$(document).ready(function(){
	//var loading=loadingDiv();
	//$('body').append(loading);
	var img="<img src='http://www.movidamovil.com/descargas/images/cmobile/loading.gif' alt='cargando contenido'/>";
	$('.diputados').html(img);
});

$(function(){
	var Router = Backbone.Router.extend({
		diputados: null,
		circunscripciones: null,
		grupos: null,
		initialize: function(){
			this.apiCall(
				"diputados",
				{q:'{"activo":1}',order:'{"normalized.apellidos":1}',only:'["id","nombre","apellidos","fecha_nac","grupo","partido","sexo","circunscripcion","normalized","contacto","sueldo.bruto_mes","actividad.iniciativas.total","actividad.intervenciones.total"]'}, 
				function(_data){this.diputados = _data;});	
			this.apiCall(
				"circunscripciones",
				{order:'{"normalized.nombre":1}',only:'["id","nombre","normalized"]'}, 
				function(_data){ this.circunscripciones=_data;});
			this.apiCall(	
				"grupos",
				{order:'{"num_diputados":1}',only:'["id","nombre"]'}, 
				function(_data){ this.grupos=_data; });
		},
		routes:{
			'' : 'basicaHandler',
			'(order/:ord)(/)(filter/:fil)' : 'dipusHandler'
		},
	
		basicaHandler: function(){
			//alert('sin parámetros');
			if(!this.diputados || !this.grupos || !this.circunscripciones){
				setTimeout(this.basicaHandler,1000);
				return;
			}
			var datos=[];
			datos.data=this.diputados;
			var numDipus=_.size(datos.data);
			var template = templateDipu('grupo');
			$('h3.title').text(numDipus+" diputados");
			$('.diputados').html( Mustache.render(template, datos));
		},

		dipusHandler: function(ord,fil){
			//console.log(ord+" "+fil);
			//$('.diputados').hide();
			if(!this.diputados || !this.grupos || !this.circunscripciones){
				setTimeout(this.dipusHandler,1000,ord,fil);
				return;
			}

			// Comprobamos validez de url
			var urlValida=true;
			if(ord == null && fil== null){
				urlValida=false;
			}else{
				// Comprobamos que ord y fil son validos
				var valid=validParams(ord,fil);
				if(valid === false){
					urlValida=false;
				}
			}
		
			// Si la url no es válida, no seguimos
			if(urlValida==false){
				window.location.href='/404';
				//alert('url no válida');
				return;
			}
	
			// Pre-procesamos --> Incluimos en diputados campos que se vayan a necesitar
			var ordenes,filtros;
			if(ord!=null){
			   ordenes=ord.split('&');
			   _.each(ordenes,function(orden){
				switch(orden){
				   case 'edad':
					if(typeof(diputados[0].edad) == "undefined"){
						_.each(diputados,function(dipu){
							dipu.edad=edad(dipu.fecha_nac);
						});
					}
					break;
				}
			   });
			}else{
				ordenes=null;
			}
			
			if(fil != null){
			   filtros=fil.split('&');
			   _.each(filtros,function(filtro){
				switch(filtro){
				   case 'sintw': case 'contw':
					_.each(diputados, function(dipu){ 
						if(typeof(dipu.contacto) != "undefined"){
							_.each(dipu.contacto,function(c){
								if(c.tipo=="twitter"){
									dipu.tw=c.url;
									return;
								}
							});
						}
					});
					break;
	
				   case 'confb': case 'sinfb':
					_.each(diputados, function(dipu){ 
						if(typeof(dipu.contacto) != "undefined"){
							_.each(dipu.contacto,function(c){
								if(c.tipo=="facebook"){
									dipu.fb=c.url;
									return;
								}
							});
						}
					});
					break;
					
				   case 'concorreo': case 'sincorreo':
					_.each(diputados, function(dipu){ 
						if(typeof(dipu.contacto) != "undefined"){
							var correos=[];
							var i=0;
							_.each(dipu.contacto,function(c){
								if(c.tipo=="email"){
									correos[i]=c.url;
									i++;
								}
							});
							if(correos.length>0) dipu.correos=correos;
						}
					});
					break;
			      }
			   });
			}else{
				filtros=null;
			}

			// Procesamos --> Ordenamos y filtramos
			var sub='';
			var subrs=[];
			var datos=[];
			dipus=_.clone(this.diputados);

			if(filtros != null){
			   var filtros=fil.split('&');
			   //filtros=separarFiltros(filtros);
			   var temp=[], dipusG=[], dipusC=[];
			   _.each(filtros,function(filtro){
	
			   // Filtros para GP
			   if(filtro.indexOf('grupo=')==0){
				var gruposf=filtro.substr(6).split('+');
				var grupo;
				_.each(gruposf,function(grupof){
					grupo = _.find(this.grupos, function(g){ 
						return grupof == toSlug(g.nombre); });
				   	temp=_.filter(dipus, function(dipu){ 
						return dipu.grupo==grupo.nombre;});
					dipusG=_.union(dipusG,temp);
				});
				if(dipusG.length > 0) dipus=dipusG;
			   }
			
			   // Filtros para circuns
			   else if(filtro.indexOf('circuns=')==0){
				var circunsf=filtro.substr(8).split('+');
				var circuns;
				_.each(circunsf,function(circunf){
					circuns = _.find(this.circunscripciones, function(c){ 
						return circunf == c.normalized.url; });
				   	temp=_.filter(dipus, function(dipu){ 
						return dipu.circunscripcion==circuns.nombre;});
					dipusC=_.union(dipusC,temp);
				});
				if(dipusC.length > 0) dipus=dipusC;
			   }

			   // Otros filtros
			   else{
				switch(filtro){
				   case 'sintw':
					dipus=_.filter(dipus, function(dipu){ return (typeof(dipu.tw) == "undefined");});
					break;
				
				   case 'contw':
					dipus=_.filter(dipus, function(dipu){ return (typeof(dipu.tw) != "undefined");});
					subrs.push('tw');
					break;

				   case 'sinfb':
					dipus=_.filter(dipus, function(dipu){ return (typeof(dipu.fb) == "undefined");});
					break;
				
				   case 'confb':
					dipus=_.filter(dipus, function(dipu){ return (typeof(dipu.fb) != "undefined");});
					subrs.push('fb');
					break;

				   case 'sincorreo':
					dipus=_.filter(dipus, function(dipu){ return (typeof(dipu.correos) == "undefined");});
					break;
				
				   case 'concorreo':
					dipus=_.filter(dipus, function(dipu){ return (typeof(dipu.correos) != "undefined");});
					subrs.push('correos');
					break;

				   case 'mujeres':
					dipus=_.filter(dipus, function(dipu){ return  dipu.sexo=="M" ;});
					break;

				   case 'hombres':
					dipus=_.filter(dipus, function(dipu){ return  dipu.sexo=="H" ;});
					break;

				   case 'sininic':
					dipus=_.filter(dipus, function(dipu){ 
						return  dipu.actividad[0].iniciativas.total==0 ;});
					break;

				   case 'sininterv':
					dipus=_.filter(dipus, function(dipu){ 
						return  dipu.actividad[0].intervenciones.total==0 ;});
					break;
				}
			   }
			   });
			}

			if(ordenes!=null){
			   _.each(ordenes,function(orden){
				switch(orden){
				   case 'edad':
					dipus=_.sortBy(dipus, function(dipu){ return dipu.edad; });	
					sub='edad';
					break;

				   case 'nombre':
					dipus=_.sortBy(dipus, function(dipu){ return dipu.normalized.apellidos; });
					break;

				   case 'salario':
					dipus= _.sortBy(dipus, function(dipu){ return dipu.sueldo.bruto_mes; });
					dipus.reverse();
					sub='sueldo';
					break;

				   case 'inic':
					dipus= _.sortBy(dipus, function(dipu){ 
						return dipu.actividad[0].iniciativas.total; });
				   	sub='inic';
					break;

				   case 'interv':
					dipus= _.sortBy(dipus, function(dipu){ 
						return dipu.actividad[0].intervenciones.total; });
					sub='interv';
					break;
				}
			   });
			}else{
				dipus= _.sortBy(dipus, function(dipu){ 
					return dipu.normalized.apellidos; 
				});		
			}

			datos.data=dipus;
			var template = templateDipu(sub,subrs);
			var numDipus=_.size(dipus);
			$('h3.title').text(numDipus+' diputados');
			$('.diputados').html( Mustache.render(template, datos) );	
			//$('.diputados').show();
		},

		/*numDipusHandler: function(){
			if(!this.comisiones){
				setTimeout(this.numDipusHandler,500);
				return;
			}
			$.ajax({
                                url:'http://api.quehacenlosdiputados.net/diputados',
				data: 'q={"cargos_congreso.tipoOrgano":"^C"}&only=["cargos_congreso"]'
                        }).done(function(result){
                                cargos_congreso=result;
				_.each(comisiones,function(com){
					//console.log('Comisión'+com.id+' iterando...');
					var num=0;
                   			_.each(cargos_congreso,function(dipu){
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

				var ordenadas=[];
				var datos = _.sortBy(comisiones, function(com){ return com.numDiputados; });
				datos.reverse();
				ordenadas.data=datos;
				//console.log(ordenadas);	
				var template = "<table>{{#data}}<tr><td><a href='organo/{{normalized.url}}'>{{nombre}}</a> ({{numDiputados}} diputados)</td></tr> {{/data}} </table>";
				$('#tabsComisiones').html(tagsCom("numDipus"));
				$('.containerComisiones').html( Mustache.render(template, ordenadas) );
                        });

		},*/

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
