function edad(fechanac) {
	var date = fechanac;
	var nums = date.split('/');
	var nac= new Date(nums[2],nums[1],nums[0]);
	var hoy=new Date();
	return parseInt((hoy - nac)/365/24/60/60/1000);
}

function legistotxt(legis){
	var n=legis.length+1;
	var legistxt=n+" legislaturas (X";
	if(n==1){
		legistxt+=")";
		return legistxt;
	}else{
		var i=1;
		_.each(legis,function(leg){
			if(n-1==i){
				legistxt+=" y "+leg+")";
			}else{
				legistxt+=", "+leg;
			}
			i++;
		});
		return legistxt;
	}
}

function toSlug(text){
  	var str=text.toLowerCase().replace(/\s/g,'-');
	var from = "àáäâèéëêìíïîòóöôùúüûñç";
  	var to   = "aaaaeeeeiiiioooouuuunc";
  	for (var i=0, l=from.length ; i<l ; i++) {
    		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  	}
	return str;
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
		case 'inic': txtsub='{{actividad.iniciativas.total}} iniciativas';break;
		case 'interv': txtsub='{{actividad.intervenciones.total}} intervenciones';break;
		case 'grupo': case '': txtsub='G.P. {{grupo}}';break;
		case 'circuns': txtsub='{{circunscripcion}}';break;
		case 'nlegis': txtsub='{{legistxt}}'; break;
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
				case 'edad': case 'salario': case 'nombre': case 'inic': case 'interv': case 'nlegis':
				case 'edadR': case 'salarioR': case 'nombreR': case 'inicR': case 'intervR': case 'nlegisR':
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
				return;
			}

			// Filtro de circunscripcion
			if(filtro.indexOf('circuns=')==0){
				var circunsf=filtro.substr(8).split('+');
				_.each(circunsf,function(circunf){
					enc = _.find(this.circunscripciones, function(c){ 
						return circunf == c.normalized.url; });
					if(enc == undefined) valido=false;
				});
				return;
			}

			// Filtro de cargos
			if(filtro.indexOf('cargo=')==0){
				var cargosf=filtro.substr(6).split('+');
				_.each(cargosf,function(cargof){
					switch(cargof){
						case 'P': case 'VP': case 'S': case 'PO': case 'POT': case 'POA':
						case 'POS': case 'V': case 'VS': case 'A':
							break;
						default:
							valido=false; return;
					}
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

function ordenURL(url){
	var orden=url.match(/^order\/(\w|\-)*/);
	if(orden==null){
		return '';
	}else{
		return orden[0];
	}
}

function filtrosURL(url){
	var filtros=url.match(/filter\/.*$/);
	if(filtros==null){
		return '';
	}else{
		return filtros[0];
	}
}

function anadirOrdenUrl(ord){
	var urlBB=Backbone.history.fragment;
	if(urlBB == "" || urlBB.match(/filter\//)==null){
		return "order/"+ord;
	}else{
		var filterPart=urlBB.match(/filter\/.*$/);
		return "order/"+ord+"/"+filterPart[0];
	}
}

function anadirFiltroUrl(filtro,tipoFiltro){
	var urlBB=Backbone.history.fragment;
	var orden, filtrosAnt,filtros;
	orden=ordenURL(urlBB);
	filtrosAnt=filtrosURL(urlBB);	

	if(filtrosAnt==''){
		if(filtro.indexOf(tipoFiltro)!=-1){
			filtro=filtro.replace(tipoFiltro+"-",tipoFiltro+"=");
		}
		filtros='filter/'+filtro;
	}else{
		var arrayFil=filtrosAnt.substr(7).split('&');
		var excluyentes = ["mujeres","hombres","sintw","contw","sinfb","confb","sincorreo","concorreo"];
		
		// Si es un filtro ya añadido, informamos y no hacemos nada
		if( _.contains(arrayFil,filtro) == true){
			alert('Ya tienes ese filtro añadido');
			$('#'+tipoFiltro+' option[value="no"]').attr("selected","selected");	
			return false;
		
		// Si es un filtro excluyente, lo sustituimos por su asociado
		}else if(_.contains(excluyentes,filtro)==true){
			var excluyentesAsoc = ["hombres","mujeres","contw","sintw","confb","sinfb","concorreo","sincorreo"];
			var i=_.indexOf(excluyentes,filtro);
			if(_.contains(arrayFil,excluyentesAsoc[i])){
				filtros=filtrosAnt.replace(excluyentesAsoc[i],filtro);
			}else{
				filtros=filtrosAnt+'&'+filtro;
			}					
		
		// Si es un filtro de los que se comportan como OR, hay que procesar de forma diferente
		}else if(filtro.indexOf(tipoFiltro+"-") == 0){
			var filtroSinPre=filtro.replace(tipoFiltro+"-","");
			
			// Si no había filtros de ese tipo, añadimos 'tipoFiltro='
			if(filtrosAnt.indexOf(tipoFiltro+"=") == -1){
				filtros=filtrosAnt+'&'+tipoFiltro+'='+filtroSinPre;
				
			/* Si había filtros de ese tipo:
			 	- (1) Si estaba ya, informamos y no hacemos nada
				- (2) Si no estaba ya, lo añadimos*/
			}else{
				var filtroTipoAnt = _.find(arrayFil, function(fil){
					return fil.indexOf(tipoFiltro+"=") == 0; });
				var arrayFiltrosTipo=filtroTipoAnt.substr(tipoFiltro.length+1).split('+');
				// (1)
				if(_.contains(arrayFiltrosTipo,filtroSinPre) == true){
					alert('Ese filtro ya está seleccionado');
					$('#'+tipoFiltro+' option[value="no"]').attr("selected","selected");
					return false;
				// (2)
				}else{
					filtros=filtrosAnt.replace(filtroTipoAnt,filtroTipoAnt+"+"+filtroSinPre);
				}
			}
		// Si no es ninguna de las anteriores, simplemente lo incluimos al final
		}else{
			filtros=filtrosAnt+'&'+filtro;
		}	
	}	
	if(orden==''){
		return filtros;
	}else{
		return orden+'/'+filtros;
	}
}

function dibujaFiltrosActivos(){
	var urlBB=Backbone.history.fragment;
	var excluyentes = ["mujeres","hombres","sintw","contw","sinfb","confb","sincorreo","concorreo"];
	var excluyentesAsoc = ["hombres","mujeres","contw","sintw","confb","sinfb","concorreo","sincorreo"];
	var html='';
	filtrosCad=filtrosURL(urlBB);
	if(filtrosCad==''){
		html='<p >Sin filtros añadidos. A la derecha los tienes ;)</p>';
	}else{
		filtros=filtrosCad.substr(7).split('&');
		var tipos=[];
		$('.filtro').each(function(){
			tipos.push($(this).attr('id'));
		});
		
		_.each(filtros,function(filtro){
			var grupoFiltro='';
			var titleQuitar="Eliminar filtro";
			var texto,quitar;
			_.each(tipos,function(tipo){
				if(filtro.indexOf(tipo)==0){
					grupoFiltro=tipo;
					return;
				}
			});

			if(grupoFiltro!=''){
			// Si es de tipo or, recorremos (una cajita para cada valor) 
				filtro=filtro.replace(grupoFiltro+"=","");
				filtrosGrupo=filtro.split('+');
				var subFiltro;
				_.each(filtrosGrupo,function(filtroG){
					subFiltro=grupoFiltro+'-'+filtroG;
					texto=$(".filtro option[value='"+subFiltro+"']").text();
					if(grupoFiltro == "grupo") texto="G.P. "+texto;
					html+='<span>'+texto+'<a title="'+titleQuitar+'" href="javascript:quitaFiltro(\''+subFiltro+'\')"> <i class="fa fa-times"> </i></a></span>';
				});
			}else{ 
				texto=$(".filtro option[value='"+filtro+"']").text();
				quitar='<a title="'+titleQuitar+'" href="javascript:quitaFiltro(\''+filtro+'\')"> <i class="fa fa-times"> </i></a>';

				if(_.contains(excluyentes,filtro)==true){
				// Si es un filtro excluyente, lo sustituimos por su asociado
					var i=_.indexOf(excluyentes,filtro);
					var filtroAsoc=excluyentesAsoc[i];
					var titleCambiar="Cambiar a '"+ $(".filtro option[value='"+filtroAsoc+"']").text()+"'";
					var cambiar='<a title="'+titleCambiar+'" href="javascript:cambiaFiltro(\''+filtroAsoc+'\')"> <i class="fa fa-refresh"> </i></a>';
					html+='<span>'+texto+cambiar+quitar+'</span>';
					//html+='<span>'+texto+'<a href="javascript:quitaFiltro(\''+filtro+'\')"> <i class="fa fa-times"> </i></a></span>';
				}else{
				// Si no es de tipo or ni excluyente, lo pintamos tal cual
					html+='<span>'+texto+quitar+'</span>';
				}
			}
		});
	}
	return html;
}

function quitaFiltro(filtro){
	var urlBB=Backbone.history.fragment;
	var arrFiltros=filtrosURL(urlBB).substr(7).split('&');
	var orden=ordenURL(urlBB);
	var url,tipos;
	var grupoFiltro='';
	var filtros="filter/";

	$('.filtro').each(function(){
		if(filtro.indexOf($(this).attr('id')) == 0 ){
			grupoFiltro=$(this).attr('id');
		}
	});

	if(grupoFiltro==''){	
		_.each(arrFiltros,function(filtroPrev){
			if(filtroPrev != filtro)
				filtros+=filtroPrev+"&";
		});
	}else{
		_.each(arrFiltros,function(filtroPrev){
			if(filtroPrev.indexOf(grupoFiltro+"=")==0){
				var valorFiltro=filtro.replace(grupoFiltro+"-","");
				var filtrosGrupo=filtroPrev.replace(grupoFiltro+"=","").split('+');
				var nuevoFiltrosGrupo=grupoFiltro+"=";
				_.each(filtrosGrupo,function(fg){
					if(fg!=valorFiltro)
						nuevoFiltrosGrupo+=fg+"+";
				});
				
				//alert(nuevoFiltrosGrupo);
				if(nuevoFiltrosGrupo!=grupoFiltro+"="){
					nuevoFiltrosGrupo=nuevoFiltrosGrupo.substring(0,nuevoFiltrosGrupo.length-1);
					//alert(nuevoFiltrosGrupo);
					filtros+=nuevoFiltrosGrupo+"&";
				}
			}else{
				filtros+=filtroPrev+"&";
			}
		});
		
	}

	if (filtros!="filter/"){
		filtros=filtros.substring(0,filtros.length-1);
		//alert(filtros);
		if(orden==''){
			url=filtros;
		}else{
			url=orden+'/'+filtros;
		}
	}else{
		url=orden;
	}

	if(url=="") window.location.href="diputados";
	window.location.href="diputados#"+url;
}

function cambiaFiltro(filtro){
	var tipoFiltro=$('.filtro option[value="'+filtro+'"]').parent().attr("id");
	anadeFiltro(filtro,tipoFiltro);
}

function anadeFiltro(filtro,tipoFiltro){
	var url=anadirFiltroUrl(filtro,tipoFiltro);
	if(url!=false) window.location.href="diputados#"+url;
}

$(document).ready(function(){
	//var loading=loadingDiv();
	//$('body').append(loading);
	//var img="<img style='height:90px;' src='http://www.memeteca.com/fichas_img/4493_rajoy-gangham-style.gif' alt='cargando contenido'/>";
	
	var img="<img style='height:70px' src='http://r20.imgfast.net/users/2011/47/97/95/smiles/1546016546.gif' alt='cargando contenido' />";
	$('.diputados').html(img);
	$('#dipusdiv').show();
});

$('#ordenes').change(function() {
	var orden=$('#ordenes option:selected').val();
	var url = anadirOrdenUrl(orden);
	window.location.href="diputados#"+url;
});

$('.filtro').change(function(){
	var tipoFiltro=$(this).attr('id');
	var filtro,url;
	filtro=$('#'+tipoFiltro+' option:selected').val();
	anadeFiltro(filtro,tipoFiltro);
});

$(function(){
	var Router = Backbone.Router.extend({
		diputados: null,
		circunscripciones: null,
		grupos: null,
		cargos_dipus: null,
		initialize: function(){
			this.apiCall(
				"diputados",
				{q:'{"activo":1}',order:'{"normalized.apellidos":1}',only:'["id","nombre","apellidos","fecha_nac","grupo","partido","legislaturas","sexo","circunscripcion","normalized","contacto","cargos_congreso","sueldo.bruto_mes","actividad.iniciativas.total","actividad.intervenciones.total"]'}, 
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

		getCargosDipus: function(){
			this.apiCall(
				"diputados",
				{only:'["id","cargos_congreso"]'}, 
				function(_data){this.cargos_dipus = _data;});	
		},

		routes:{
			'' : 'basicaHandler',
			'(order/:ord)(/)(filter/:fil)' : 'dipusHandler'
		},
	
		basicaHandler: function(){
			//alert('sin parámetros');
			if(!this.diputados || !this.grupos || !this.circunscripciones){
				setTimeout(this.basicaHandler,2000);
				return;
			}
			var datos=[];
			datos.data=this.diputados;
			var numDipus=_.size(datos.data);
			var template = templateDipu('grupo');
			$('h3.title').text(numDipus+" diputados");
			$('.diputados').html( Mustache.render(template, datos));
			if(datos.data.length > 40){	
				$('#volverarriba a').show();
			}else{
				$('#volverarriba a').hide();
			}
		},

		dipusHandler: function(ord,fil){
			//console.log(ord+" "+fil);
			//$('.diputados').hide();
			if(!this.diputados || !this.grupos || !this.circunscripciones){
				setTimeout(this.dipusHandler,2000,ord,fil);
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
			   var temp=[], dipusG=[], dipusC=[], dipusCarg=[];
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
				dipus=dipusG;
			   }
			
			   // Filtros para circuns
			   else if(filtro.indexOf('circuns=')==0){
				var circunsf=filtro.substr(8).split('+');
				var circuns;
				_.each(circunsf,function(circunf){
					//alert();
					circuns = _.find(this.circunscripciones, function(c){ 
						return circunf == c.normalized.url; });
				   	temp=_.filter(dipus, function(dipu){ 
						return dipu.circunscripcion==circuns.nombre;});
					dipusC=_.union(dipusC,temp);
				});
				//if(dipusC.length > 0) 
				if(circunsf.length > 1) sub='circuns';
				dipus=dipusC;
			   }

			   // Filtros para cargos en el congreso	
			   else if(filtro.indexOf('cargo=')==0){
				var cargosf=filtro.substr(6).split('+');
				var dipuscargo;
				// Si no está cargos_dipus, lo añadimos
				_.each(cargosf,function(cargof){
					//alert();
					dipuscargo=[];
					_.each(this.diputados, function(dipu){
						var tiene=false;
						_.each(dipu.cargos_congreso,function(c){
							if(cargof=='VP' || cargof=='S'){
							   if(typeof(c.baja) == "undefined" && c.cargo.indexOf(cargof)==0)
								tiene=true;
							}else{	
							   if(typeof(c.baja) == "undefined" && c.cargo == cargof)
								tiene=true;
							}
						});
						if(tiene==true){
							dipuscargo.push(dipu.id);
						}
					});

				   	temp=_.filter(dipus, function(dipu){ 
						return _.contains(dipuscargo,dipu.id)==true && _.contains(temp,dipu.id)==false});
					dipusCarg=_.union(dipusCarg,temp);
				});
				//if(dipusC.length > 0) 
				//if(circunsf.length > 1) sub='circuns';
				dipus=dipusCarg;
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
				   case 'edad': case 'edadR':
					dipus=_.sortBy(dipus, function(dipu){ return dipu.edad; });
					if(orden=='edadR') dipus.reverse();
					sub='edad';
					break;

				   case 'nombre': case 'nombreR':
					dipus=_.sortBy(dipus, function(dipu){ return dipu.normalized.apellidos; });
					if(orden=='nombreR') dipus.reverse();
					break;

				   case 'salario': case 'salarioR':
					dipus= _.sortBy(dipus, function(dipu){ return dipu.sueldo.bruto_mes; });
					if(orden=='salarioR') dipus.reverse();
					sub='sueldo';
					break;

				   case 'inic': case 'inicR':
					dipus= _.sortBy(dipus, function(dipu){ 
						return dipu.actividad.iniciativas.total; });
					if(orden=='inicR') dipus.reverse();
				   	sub='inic';
					break;

				   case 'interv': case 'intervR':
					dipus= _.sortBy(dipus, function(dipu){ 
						return dipu.actividad.intervenciones.total; });
					if(orden=='intervR') dipus.reverse();
					sub='interv';
					break;

				   case 'nlegis': case 'nlegisR':
					dipus=_.sortBy(dipus, function(dipu){
						if(typeof(dipu.legislaturas) == "undefined"){
							dipu.legistxt="1 legislatura (X)";
							return 0;
						}else{
							dipu.legistxt=legistotxt(dipu.legislaturas);
							return dipu.legislaturas.length;
						}
					});
					if(orden=='nlegisR') dipus.reverse();
					sub='nlegis';
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
			$('#filtrosActivos').html(dibujaFiltrosActivos());
			$('.filtro option[value="no"]').attr("selected","selected");
			
			$('#ordenes option[value="'+ord+'"]').attr("selected","selected");
			$('.diputados').show();
			if(dipus.length > 40){	
				$('#volverarriba a').show();
			}else{
				$('#volverarriba a').hide();
			}
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
