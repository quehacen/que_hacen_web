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
	//div+="<span>Cargando intervenciones</span>";
	div+="</div>";
	return div;
}

// function validParams(order,filter)

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

function busquedaTextoInic(){
	var texto=$('.filtrosContainer #textoBusc').val().replace(/\s+/g, ' ').trim();
	if(texto=="" || texto==" "){
		alert("El campo de búsqueda está vacío.");
	}
	var textoNorm= texto.replace('"',"\"");
	anadeFiltro(textoNorm,"texto");
}


function filtroTramitGlobal(filtros){
	var global='';
	var filtrosTramit=getFiltrosTipo(filtros,"tramit");
	_.each(filtrosTramit,function(filtro){
		if(tramit=="EXITO"){
			global="EXITO";
		}else if(filtro=="NEXITO"){
			global="NEXITO";
		}
	});
	if (global=='') return false;
	return global;
}

function getFiltrosTipo(filtros,filtroTipo){
	var filtrosTipo=[];
	_.each(filtros,function(filtroT){
		if(filtroT.indexOf(filtroTipo)==0){
			filtrosTipo=filtroT.substr(filtroTipo.length+1).split('+');
		}
	});
	return filtrosTipo;
}

function anadirFiltroUrl(filtro,tipoFiltro){
	var urlBB=Backbone.history.fragment;
	var filtrosAnt,filtros;
	//orden=ordenURL(urlBB);
	filtrosAnt=filtrosURL(urlBB);

	if(filtrosAnt==''){
		if(filtro.indexOf(tipoFiltro)!=-1){
			filtro=filtro.replace(tipoFiltro+"-",tipoFiltro+"=");
		}else if(tipoFiltro=="tipo_autor"){
			if(filtro.indexOf("diputado")!=-1){
				filtro="diputado=todos";
			}else if(filtro.indexOf("grupo")){
				filtro="grupo=todos";
			}
		}else if(tipoFiltro=="texto"){
			var palabras=filtro.replace(' ','+');
			filtro="texto="+palabras;
		}
		filtros='filter/'+filtro;
	}else{
		var arrayFil=filtrosAnt.substr(7).split('&');
		var excluyentes = ["individual","compartida"];
		
		// Si es un filtro ya añadido, informamos y no hacemos nada
		if( _.contains(arrayFil,filtro) == true){
			alert('Ya tienes ese filtro añadido');
			$('#'+tipoFiltro+' option[value="no"]').attr("selected","selected");	
			return false;
		
		// Si es un filtro excluyente, lo sustituimos por su asociado
		}else if(_.contains(excluyentes,filtro)==true){
			var excluyentesAsoc = ["compartida","individual"];
			var i=_.indexOf(excluyentes,filtro);
			if(_.contains(arrayFil,excluyentesAsoc[i])){
				filtros=filtrosAnt.replace(excluyentesAsoc[i],filtro);
			}else{
				filtros=filtrosAnt+'&'+filtro;
			}	
		}else if(tipoFiltro=="texto"){
			var arrayFiltrosTipo=getFiltrosTipo(arrayFil,"texto");
			var palabras=filtro.split(' ');
			var filTexto="texto=";
			_.each(palabras,function(pal){
				filTexto+=pal+"+";
			});
			filTexto=filTexto.substring(0,filTexto.length-1);
			if(arrayFiltrosTipo.length==0){
				filtros="filter/"+filTexto+"&";
				_.each(arrayFil,function(filAnt){
					filtros+=filAnt+"&";
				});
				filtros=filtros.substring(0,filtros.length-1);
			}else{
				filtros="filter/";
				_.each(arrayFil,function(filAnt){
					if(filAnt.indexOf("texto=")!=0){
						filtros+=filAnt+"&";
					}else{
						filtros+=filTexto+"&";
					}
				});
				filtros=filtros.substring(0,filtros.length-1);
			}
		// Si es de tipo autor, hay que buscar y quitar el tipo de autor anterior
		}else if(tipoFiltro=="tipo_autor"){		
			if(filtro.indexOf("diputado")!=-1){
				var filtroTipoAnt = _.find(arrayFil, function(fil){
					return fil.indexOf("diputado=") == 0; });
				
				if(filtroTipoAnt!=undefined){
					alert('Ese filtro ya está seleccionado');
					//$('#'+tipoFiltro+' option[value="no"]').prop("selected",true);	
					return false;
				}
				filtros="filter/diputado=todos&";
				_.each(arrayFil,function(filAnt){
					if(filAnt.indexOf("grupo=")!=0)
						filtros+=filAnt+"&";
				});
				filtros=filtros.substring(0,filtros.length-1);
			
			}else if(filtro.indexOf("grupo")!=-1){
				var filtroTipoAnt = _.find(arrayFil, function(fil){
					return fil.indexOf("grupo=") == 0; });
				
				if(filtroTipoAnt!=undefined){
					alert('Ese filtro ya está seleccionado');
					//$('#'+tipoFiltro+' option[value="no"]').prop("selected",true);	
					return false;
				}
				filtros="filter/grupo=todos&";
				_.each(arrayFil,function(filAnt){
					if(filAnt.indexOf("diputado=")!=0)
						filtros+=filAnt+"&";
				});
				filtros=filtros.substring(0,filtros.length-1);
			}
		
		// Si es un filtro de fecha (desde o hasta), hay que quitar el anterior en caso de que esté
		}else if(tipoFiltro=="desde" || tipoFiltro=="hasta"){
			var filtroTipoAnt = _.find(arrayFil, function(fil){
				return fil.indexOf(tipoFiltro+"=") == 0; });
				
			if(filtroTipoAnt==undefined){
                                filtros="filter/"+filtro+"&";
                                _.each(arrayFil,function(filAnt){
                                        filtros+=filAnt+"&";
                                });
                                filtros=filtros.substring(0,filtros.length-1);
                        }else{
                                filtros="filter/";
                                _.each(arrayFil,function(filAnt){
                                        if(filAnt.indexOf(tipoFiltro+"=")!=0){
                                                filtros+=filAnt+"&";
                                        }else{
                                                filtros+=filtro+"&";
                                        }
                                });
                                filtros=filtros.substring(0,filtros.length-1);
                        }

		// Si es un filtro de los que se comportan como OR, hay que procesar de forma diferente
		}else if(filtro.indexOf(tipoFiltro+"-") == 0){
			var arrayFiltrosTipo=getFiltrosTipo(arrayFil,tipoFiltro);
			var filVal=filtro.substr(tipoFiltro.length+1);
			// Si el filtro ya está añadido, informamos y no hacemos nada
			if(_.contains(arrayFiltrosTipo,filVal)){
				alert('Ese filtro ya está seleccionado');
				$('#'+tipoFiltro+' option[value="no"]').prop("selected",true);	
				return false;
			}else{
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
						$('#'+tipoFiltro+' option[value="no"]').prop("selected",true);	
						return false;
					// (2)
					}else{
						filtros=filtrosAnt.replace(filtroTipoAnt,filtroTipoAnt+"+"+filtroSinPre);
					}
				}
			}
		// Si no es ninguna de las anteriores, simplemente lo incluimos al final
		}else{
			filtros=filtrosAnt+'&'+filtro;
		}	
	}	
	return filtros;

	/*if(orden==''){
		return filtros;
	}else{
		return orden+'/'+filtros;
	}*/
}

function dibujaFiltrosActivos(){
	var urlBB=Backbone.history.fragment;
	var html='';
	filtrosCad=filtrosURL(urlBB);
	if(filtrosCad==''){
		html='';
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
			if(filtro=="grupo=todos" || filtro=="diputado=todos"){
				if(filtro=="diputado=todos"){
					texto="Diputados";
					subFiltro="diputado=todos";
				}else{
					texto="Grupos Parlamentarios";
					subFiltro="grupo=todos";
				}
				html+='<span>'+texto+'<a title="'+titleQuitar+'" href="javascript:quitaFiltro(\''+subFiltro+'\')"> <i class="fa fa-times"> </i></a></span>';
			}else if(filtro.indexOf("texto=")==0){
				// Si es de tipo texto, una cajita para todas las palabras
				texto=decodeURI("Texto: '"+filtro.substr(6).replace(/\+/g," ").toLowerCase()+"'");
				
				quitar='<a title="'+titleQuitar+'" href="javascript:quitaFiltro(\''+filtro+'\')"> <i class="fa fa-times"> </i></a>';
				html+='<span>'+texto+quitar+'</span>';

			}else if(filtro.indexOf("desde=")==0 || filtro.indexOf("hasta=")==0){
				// Si es de tipo fecha: '(Desde|Hasta) <fecha>'
				var tipoFecha;
				var fecha=filtro.substr(6).replace(/\-/g,'/');
				var arrF=fecha.split('/');
				if(filtro.indexOf("desde")==0){
					tipoFecha="Desde el";
					var fechaMin=new Date(parseInt(arrF[2]),parseInt(arrF[1])-1,parseInt(arrF[0]));
					$( "#hasta" ).datepicker( "option", "minDate",fechaMin);
					$( "#desde" ).prop('placeholder', "Desde: "+fecha);
				}else{	
					tipoFecha="Hasta el";
					var fechaMax=new Date(parseInt(arrF[2]),parseInt(arrF[1])-1,parseInt(arrF[0]));
					$( "#desde" ).datepicker( "option", "maxDate",fechaMax);
					$( "#hasta" ).prop('placeholder', "Hasta: "+fecha);
				}
				texto=tipoFecha+' '+fecha;
				
				quitar='<a title="'+titleQuitar+'" href="javascript:quitaFiltro(\''+filtro+'\')"> <i class="fa fa-times"> </i></a>';
				html+='<span>'+texto+quitar+'</span>';

			}else if(grupoFiltro!=''){
				// Si es de tipo or, recorremos (una cajita para cada valor) 
				filtro=filtro.replace(grupoFiltro+"=","");
				filtrosGrupo=filtro.split('+');
				var subFiltro;
				_.each(filtrosGrupo,function(filtroG){
					subFiltro=grupoFiltro+'-'+filtroG;
					texto=$(".filtro option[value='"+subFiltro+"']").text();
					//if(grupoFiltro == "grupo") texto="G.P. "+texto;
					html+='<span>'+texto+'<a title="'+titleQuitar+'" href="javascript:quitaFiltro(\''+subFiltro+'\')"> <i class="fa fa-times"> </i></a></span>';
				});
			}else{ 
				texto=$(".filtro option[value='"+filtro+"']").text();
				quitar='<a title="'+titleQuitar+'" href="javascript:quitaFiltro(\''+filtro+'\')"> <i class="fa fa-times"> </i></a>';

				/*if(_.contains(excluyentes,filtro)==true){
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
				}*/
			}
		});
	}
	return html;
}

function quitaFiltro(filtro){
	var urlBB=Backbone.history.fragment;
	var arrFiltros=filtrosURL(urlBB).substr(7).split('&');
	var orden='';
	var url,tipos;
	var grupoFiltro='';
	var filtros="filter/";

	$('.filtro').each(function(){
		if(filtro.indexOf($(this).attr('id')) == 0 ){
			grupoFiltro=$(this).attr('id');
		}
	});

	if(filtro.indexOf("desde=")==0){
		alert('hola');
		$( "#hasta" ).datepicker( "option", "minDate", new Date(2011,11,13));
		$( "#desde" ).prop('placeholder', "Desde");	
	}else if(filtro.indexOf("hasta=")==0){
		$( "#desde" ).datepicker( "option", "maxDate", new Date());
		$( "#hasta" ).prop('placeholder', "Hasta");
	}

	if(grupoFiltro==''){
		if(filtro.indexOf("texto=")==0){
			_.each(arrFiltros,function(filtroPrev){
				if(filtroPrev.indexOf("texto=") != 0)
					filtros+=filtroPrev+"&";
			});
		}else{
			_.each(arrFiltros,function(filtroPrev){
				if(filtroPrev != filtro)
					filtros+=filtroPrev+"&";
			});
		}
	}else{
		if(filtro=="grupo=todos" || filtro=="diputado=todos"){
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
				
				if(nuevoFiltrosGrupo!=grupoFiltro+"="){
					nuevoFiltrosGrupo=nuevoFiltrosGrupo.substring(0,nuevoFiltrosGrupo.length-1);
					filtros+=nuevoFiltrosGrupo+"&";
				}
			}else{
				filtros+=filtroPrev+"&";
			}
		});
		}
	}

	if (filtros!="filter/"){
		filtros=filtros.substring(0,filtros.length-1);
		if(orden==''){
			url=filtros;
		}else{
			url=orden+'/'+filtros;
		}
	}else{
		url=orden;
	}

	if(url=="") window.location.href="intervenciones";
	window.location.href="intervenciones#"+url;
}

function cambiaFiltro(filtro){
	var tipoFiltro=$('.filtro option[value="'+filtro+'"]').parent().attr("id");
	anadeFiltro(filtro,tipoFiltro);
}

function anadeFiltro(filtro,tipoFiltro){
	var url=anadirFiltroUrl(filtro,tipoFiltro);
	if(url!=false) window.location.href="intervenciones#"+url;
}

function filtrosInicApiUrl(filtros){
	var tipoAutor="";
	var tiposInic=[];
	var fechasInterv=[];

	var q="q={";
	var qs=[];
	var valFil;
	var apiUrl='http://api.quehacenlosdiputados.net/intervenciones?';
	_.each(filtros,function(filtro){
	   if(filtro.indexOf("lugar=")==0){
		valFils=filtro.substr(6).split('+');
		// Incluir comisión
		var lugarQuery='"lugar":{"$in":[';
		_.each(valFils,function(valFil){
			lugarQuery+='"'+valFil+'",';
		});
		lugarQuery=lugarQuery.substring(0,lugarQuery.length-1);
		lugarQuery+=']}';
		qs.push(lugarQuery);
	   }else if(filtro.indexOf("comision=")==0){
		valFils=filtro.substr(9).split('+');
		if(valFils.length > 1){
			var autoresQuery='"id_comision":{"$in":[';
			_.each(valFils,function(valFil){
				autoresQuery+=valFil+",";
			});
			autoresQuery=autoresQuery.substring(0,autoresQuery.length-1);
			autoresQuery+=']}';
			qs.push(autoresQuery);
		}else{
			var autorQuery='"id_comision":'+ valFils[0];
			qs.push(autorQuery);
			
		}
	   }else if(filtro.indexOf("diputado=")==0){
		valFils=filtro.substr(9).split('+');
		var autoresQuery='"autor":{"$in":[';
		_.each(valFils,function(valFil){
			autoresQuery+=valFil+",";
		});
		autoresQuery=autoresQuery.substring(0,autoresQuery.length-1);
		autoresQuery+=']}';
		qs.push(autoresQuery);	
	   }else if(filtro.indexOf("desde=")==0 || filtro.indexOf("hasta=")==0){
		var opFecha;
		if(filtro.indexOf("desde")==0){
			opFecha='"$gte"';
		}else{
			opFecha='"$lte"';
		}
		var fCad=filtro.substr(6).split('-');
		var fecha=new Date(parseInt(fCad[2]),parseInt(fCad[1])-1,parseInt(fCad[0]));
		fecha=fecha.toISOString();
		fechasInterv.push(''+opFecha+':"'+fecha+'"');
	   }
	
	});

	// Si hay fechas de principio o fin, las metemos en el mismo query
	if(fechasInterv.length > 0){
		fechasQuery='"fechahora":{';
		_.each(fechasInterv,function(f){
			fechasQuery+=f+',';
		});
		fechasQuery=fechasQuery.substring(0,fechasQuery.length-1);
		fechasQuery+='}';
		qs.push(fechasQuery);
	}

	// Componemos el query total a partir de los querys de cada filtro
	_.each(qs,function(qsi){
		q+=qsi+",";
	});
	q=q.substring(0,q.length-1);
	q+="}";

	if(qs.length!=0){
		apiUrl+=q+'&order={"fechahora":-1}&limit=30';
	}else{
		apiUrl+='order={"fechahora":-1}&limit=30';
	}
	return apiUrl;
}


function enlacesFinalInterv(){
	var enlaces='<span id="volverarriba" class="enlacesfinal" style="display:block;padding:15px;text-align:center"><a style="font-size:11pt;" href="javascript:$(\'html\')[0].scrollIntoView( true );">Volver arriba</a></span>';
	enlaces+='<span id="cargarmas" class="enlacesfinal"><a href="javascript:skipIntervenciones(1)">Cargar más</a></span>';
	return enlaces;
}

function enlaceVolverArriba(){
	var enlace='<span id="volverarriba" class="enlacesfinal" style="display:block;padding:15px;text-align:center"><a style="font-size:11pt;" href="javascript:$(\'html\')[0].scrollIntoView( true );">Volver arriba</a></span>';
	return enlace;
}

function enlaceInic(numExp){
	var nums=numExp.split('/');
	return "http://www.congreso.es/portal/page/portal/Congreso/Congreso/Iniciativas?_piref73_2148295_73_1335437_1335437.next_page=/wc/servidorCGI&CMD=VERLST&BASE=IW10&FMT=INITXDSS.fmt&DOCS=1-3&DOCORDER=FIFO&OPDEF=ADJ&QUERY=%28"+nums[0]+"%2F"+nums[1]+"*.NDOC.%29";
}

function mostrarIniRel(numInterv){
	$('#iniRel'+numInterv).fadeIn();
	$('#enlaceIniRel'+numInterv).text('ocultar');
	$('#enlaceIniRel'+numInterv).attr('href','javascript:ocultarIniRel('+numInterv+')');	
}

function ocultarIniRel(numInterv){
	$('#iniRel'+numInterv).fadeOut();
	$('#enlaceIniRel'+numInterv).text('mostrar');
	$('#enlaceIniRel'+numInterv).attr('href','javascript:mostrarIniRel('+numInterv+')');	
}

function mostrarVideoInterv(numInterv){
	// Convierte el elemento a.media en vídeo
	$('#videoInterv'+numInterv+' a.media').media({autoplay:true,attrs:{ShowStatusBar:"1"}});
	
	$('#videoInterv'+numInterv).fadeIn();
	$('#enlaceVideoInterv'+numInterv).html('Ocultar intervención <i class="fa fa-times-circle"></i>');
	$('#enlaceVideoInterv'+numInterv).attr('href','javascript:ocultarVideoInterv('+numInterv+')');	
}

function ocultarVideoInterv(numInterv){
	$('#videoInterv'+numInterv).fadeOut();
	
	// Vuelve a convertir el elemento a.media en enlace
	var url=$('#videoInterv'+numInterv+' object').attr('data');
	$('#videoInterv'+numInterv+'').html('<a class="media" href="'+url+'">');
	//$('#enlaceVideoInterv'+numInterv).text('ver vídeo de la intervención');
	$('#enlaceVideoInterv'+numInterv).html('Ver intervención <i class="fa fa-play-circle"></i>');
	$('#enlaceVideoInterv'+numInterv).attr('href','javascript:mostrarVideoInterv('+numInterv+')');	
}

function htmlIntervenciones(intervenciones){      
	var masInterv="";
	var lugares=[];
	lugares["C"]="en la Comisión";
	lugares["P"]="en el Pleno";
	lugares["DP"]="en la";
	lugares["Otros"]="";
	var numInterv=1;
	var video, pdf, html;
	var enlacesTitulo,com,enCom,comEnlace;
	
        _.each(intervenciones,function(interv){
		var dipu=_.find(this.diputados,function(d){
			return d.id == interv.autor;
		});
		enCom=false;
		comEnlace='';
		if(interv.lugar=="C"){
			com=_.find(this.comisiones,function(c){
				return c.id == interv.id_comision;
			});
			enCom=true;
			comEnlace='<a href="/organo/'+com.id+'" title="Ver ficha de la Comisión '+com.pre+' '+com.nombre+'">'+com.pre+' '+com.nombre+'</a>';
		}else if(interv.lugar=="DP"){
			comEnlace='<a href="/organo/diputacion-permanente" title="Ver ficha de la Diputación Permanente">Diputación Permanente</a>';
		}
		video=false;
		pdf=false;
		html=false;
		_.each(interv.urls,function(urlInterv){
			if(urlInterv.tipo=="video") video=urlInterv.url;
			if(urlInterv.tipo=="html") html=urlInterv.url;
			if(urlInterv.tipo=="pdf") pdf=urlInterv.url;
		});
		enlacesTitulo='';
		if(html!=false) enlacesTitulo+=' <a class="enlaceExtIcon" href="'+html+'" target="_blank" title="Ver texto de la intervención en congreso.es"><i class="fa fa-external-link"> </i></a>';
		if(pdf!=false) enlacesTitulo+=' <a class="enlaceExtIcon" href="'+pdf+'" target="_blank" title="PDF con la intervención (congreso.es)" ><i class="fa fa-file-o"> </i></a>';
		//if(video!=false) enlacesTitulo+=' <a href="'+video+'" target="_blank" title="Vídeo de la intervención (congreso.es)" ><i class="fa fa-film"> </i></a>';
	
		masInterv+='<li class="intervencion" >';
		masInterv+='<a href="/diputado/'+dipu.id+'" title="Ver ficha de '+dipu.nombre+' '+dipu.apellidos+'" ><img src="/img/miniaturasDipus/'+dipu.id+'.jpg" /></a>';
		masInterv+='<span class="tituloInterv">Intervención de <a href="'+dipu.id+'" title="Ver ficha de '+dipu.nombre+' '+dipu.apellidos+'" >'+dipu.apellidos+', '+dipu.nombre+'</a> '+lugares[interv.lugar]+' '+comEnlace+'</span>';
		//masInterv+='<span class="tituloInterv">Intervención de '+dipu.apellidos+', '+dipu.nombre+' '+lugares[interv.lugar]+' '+comEnlace+'</span>';
        	
		masInterv+='<span>Fecha: '+interv.fecha+'</span>';

		if(typeof(interv.hora_inicio)=="undefined"){
			masInterv+='<span>Hora: No disponible</span>';
		}else{	
			masInterv+='<span>Hora: '+interv.hora_inicio+' h. - '+interv.hora_fin+' h.</span>';
		}
		
		masInterv+='<span>Enlaces externos: '+enlacesTitulo+'<span>';
		
		// Iniciativas relacionadas
		var enlInic;
        	if(interv.iniciativas_rel.length > 1){
        		masInterv+='<span>Iniciativas relacionadas ('+interv.iniciativas_rel.length+') <a style="font-size:8pt;" id="enlaceIniRel'+numInterv+'" href="javascript:mostrarIniRel('+numInterv+')">mostrar</a></span>';
			masInterv+='<div id="iniRel'+numInterv+'" class="iniRel" style="display:none"><ul>';
			_.each(interv.iniciativas_rel,function(ini){
				enlInic='<a class="enlaceExtIcon" href="'+enlaceInic(ini.numExp)+'" target="_blank" title="Ver ficha de la iniciativa en Congreso.es" ><i class="fa fa-external-link"> </i></a>';
				masInterv+='<li>['+ini.numExp+'] '+ini.titulo+' '+enlInic+'</li>';
			});
			masInterv+='</ul></div>';
        	}else if(interv.iniciativas_rel.length == 1){
			enlInic='<a class="enlaceExtIcon" title="Ver ficha de la iniciativa en congreso.es" href="'+enlaceInic(interv.iniciativas_rel[0].numExp)+'"><i class="fa fa-external-link"> </i></a></span>';
        		masInterv+='<span>Iniciativa relacionada: ['+interv.iniciativas_rel[0].numExp+'] '+interv.iniciativas_rel[0].titulo+' '+enlInic+'</span>';
		}
      
		//Vídeos
		var video=false;
		_.each(interv.urls,function(urlInterv){
			if(urlInterv.tipo=="video") video=urlInterv.url;
		});
		if(video!=false){
			masInterv+='<span><a id="enlaceVideoInterv'+numInterv+'" href="javascript:mostrarVideoInterv('+numInterv+')">Ver intervención <i class="fa fa-play-circle"></i></a></span>';
			masInterv+='<div id="videoInterv'+numInterv+'" class="videoInterv" style="display:none"><a class="media" href="'+video+'" ></a></div>';
		}
 	
		masInterv+='</li>';
		numInterv++;
	});

        return masInterv;
}

function skipIntervenciones(nivel){
        var saltar=nivel*30;	
	var url=Backbone.history.fragment;
	var filtrosCad=filtrosURL(url);
	var apiUrl;
	if(filtrosCad==''){
		apiUrl='http://api.quehacenlosdiputados.net/intervenciones?order={"fechahora":-1}&limit=30&skip='+saltar+'';
	}else{
		var filtros=filtrosCad.substr(7).split('&');
		apiUrl= filtrosInicApiUrl(filtros);
		apiUrl+='&skip='+saltar+'';
	}
		
        $.when(
                $.ajax(apiUrl)
         ).done(function(_data){
		var nuevas=_data;
		console.log(nuevas);	
		var masInterv="";
        	var lugares=[];
        	lugares["C"]="en la Comisión";
        	lugares["P"]="en el Pleno";
        	lugares["DP"]="en la";
        	lugares["Otros"]="";
        	var numInterv=$('.media').length+1;
        	var video, pdf, html;
        	var enlacesTitulo,com,enCom,comEnlace;

        	_.each(nuevas,function(interv){
                	var dipu=_.find(this.diputados,function(d){
                        	return d.id == interv.autor;
                	});

			// Para evitar errores inesperadoscon nuevos dipus
			if(typeof(dipu)!="undefined"){

			console.log(dipu);
                	enCom=false;
                	comEnlace='';
                	if(interv.lugar=="C"){
                        	com=_.find(this.comisiones,function(c){
                                	return c.id == interv.id_comision;
                        	});
                        	enCom=true;
                        	comEnlace='<a href="/organo/'+com.id+'" title="Ver ficha de la Comisión '+com.pre+' '+com.nombre+'">'+com.pre+' '+com.nombre+'</a>';
                	}else if(interv.lugar=="DP"){
				comEnlace='<a href="/organo/diputacion-permanente" title="Ver ficha de la Diputación Permanente">Diputación Permanente</a>';
			}
                
			video=false;
                	pdf=false;
                	html=false;
                	_.each(interv.urls,function(urlInterv){
                        	if(urlInterv.tipo=="video") video=urlInterv.url;
                        	if(urlInterv.tipo=="html") html=urlInterv.url;
                        	if(urlInterv.tipo=="pdf") pdf=urlInterv.url;
                	});
	                enlacesTitulo='';
        	        if(html!=false) enlacesTitulo+=' <a class="enlaceExtIcon" href="'+html+'" target="_blank" title="Ver texto de la intervención en congreso.es"><i class="fa fa-external-link"> </i></a>';
                	if(pdf!=false) enlacesTitulo+=' <a class="enlaceExtIcon" href="'+pdf+'" target="_blank" title="PDF con la intervención (congreso.es)" ><i class="fa fa-file-o"> </i></a>';
                	//if(video!=false) enlacesTitulo+=' <a href="'+video+'" target="_blank" title="Vídeo de la intervención (congreso.es)" ><i class="fa fa-film"> </i></a>';

               		masInterv+='<li class="intervencion" >';
                	masInterv+='<a href="/diputado/'+dipu.id+'" title="Ver ficha de '+dipu.nombre+' '+dipu.apellidos+'" ><img src="/img/miniaturasDipus/'+dipu.id+'.jpg" /></a>';
                	masInterv+='<span class="tituloInterv">Intervención de <a href="'+dipu.id+'" title="Ver ficha de '+dipu.nombre+' '+dipu.apellidos+'" >'+dipu.apellidos+', '+dipu.nombre+'</a> '+lugares[interv.lugar]+' '+comEnlace+'</span>';

                	masInterv+='<span>Fecha: '+interv.fecha+'</span>';

                	if(typeof(interv.hora_inicio)=="undefined"){
                        	masInterv+='<span>Hora: No disponible</span>';
                	}else{
                        	masInterv+='<span>Hora: '+interv.hora_inicio+' h. - '+interv.hora_fin+' h.</span>';
                	}

                	masInterv+='<span>Enlaces externos: '+enlacesTitulo+'<span>';

	                // Iniciativas relacionadas
        	        var enlInic;
                	if(interv.iniciativas_rel.length > 1){
                        	masInterv+='<span>Iniciativas relacionadas ('+interv.iniciativas_rel.length+') <a style="font-size:8pt;" id="enlaceIniRel'+numInterv+'" href="javascript:mostrarIniRel('+numInterv+')">mostrar</a></span>';
                        	masInterv+='<div id="iniRel'+numInterv+'" class="iniRel" style="display:none"><ul>';
                        	_.each(interv.iniciativas_rel,function(ini){
                                	enlInic='<a class="enlaceExtIcon" href="'+enlaceInic(ini.numExp)+'" target="_blank" title="Ver ficha de la iniciativa en Congreso.es" ><i class="fa fa-external-link"> </i></a>';
                                	masInterv+='<li>['+ini.numExp+'] '+ini.titulo+' '+enlInic+'</li>';
                        	});
                        	masInterv+='</ul></div>';
                	}else if(interv.iniciativas_rel.length == 1){
                        	enlInic='<a class="enlaceExtIcon" title="Ver ficha de la iniciativa en congreso.es" href="'+enlaceInic(interv.iniciativas_rel[0].numExp)+'"><i class="fa fa-external-link"> </i></a></span>';
                        	masInterv+='<span>Iniciativa relacionada: ['+interv.iniciativas_rel[0].numExp+'] '+interv.iniciativas_rel[0].titulo+' '+enlInic+'</span>';
                	}

                	//Vídeos
                	var video=false;
                	_.each(interv.urls,function(urlInterv){
                        	if(urlInterv.tipo=="video") video=urlInterv.url;
                	});
                	if(video!=false){
                        	masInterv+='<span><a id="enlaceVideoInterv'+numInterv+'" href="javascript:mostrarVideoInterv('+numInterv+')">Ver intervención <i class="fa fa-play-circle"></i></a></span>';
                        	masInterv+='<div id="videoInterv'+numInterv+'" class="videoInterv" style="display:none"><a class="media" href="'+video+'" ></a></div>';
                	}

                	masInterv+='</li>';
                	numInterv++;
				
			// Fin if errores inesperados nuevos dipus
			}
		});

                var siguiente=nivel+1;
                var cargarMas='<a href="javascript:skipIntervenciones('+siguiente+')">Cargar más</a>';
                $(masInterv).hide().appendTo(".intervenciones").fadeIn(1500);
                if(nuevas.length == 30){
                	var cargarMas='<a href="javascript:skipIntervenciones('+siguiente+')">Cargar más</a>';
			$('#cargarmas').html(cargarMas);
			$('#cargarmas').css('visibility','visible');
		}else{
			$('#cargarmas').css('visibility','hidden')
		}
        });
}

$(document).ready(function(){
	//var loading=loadingDiv();
	//$('body').append(loading);
	//var img="<img style='height:90px;' src='http://www.memeteca.com/fichas_img/4493_rajoy-gangham-style.gif' alt='cargando contenido'/>";
	var img="<img style='height:70px;' src='http://www.mo-experts.com/images/loading.gif'/>";
	$('.intervenciones').html(img);
	$('#intervencionesdiv').show();
	$(".datepicker").datepicker({
		minDate: new Date(2011, 11, 13),
		maxDate: new Date(),	
		changeMonth: true,
		changeYear: true,
		onSelect: function(dateText,inst){
			var tipoFecha=$(this).attr('id');
			var fechaCool=dateText.replace(/\//g,'-');
			anadeFiltro(''+tipoFecha+'='+fechaCool,tipoFecha);
			$(this).prop('placeholder',tipoFecha.charAt(0).toUpperCase() + tipoFecha.slice(1)+': '+dateText);
			$(this).val('');
		}
	});
});

$('#ordenes').change(function() {
	var orden=$('#ordenes option:selected').val();
	var url = anadirOrdenUrl(orden);
	window.location.href="intervenciones#"+url;
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
		grupos: null,
		initialize: function(){
			this.apiCall(
				"diputados",
				{q:'{"activo":{"$in":[0,1]}}',order:'{"normalized.apellidos":1}',only:'["id","nombre","apellidos","grupo"]'}, 
				function(_data){this.diputados = _data;});	
			this.apiCall(	
				"organos",
				{q:'{"tipo":"^C"}',order:'{"normalized.nombre":1}',only:'["id","pre","nombre"]'}, 
				function(_data){ this.comisiones=_data; });
		},

		getCargosDipus: function(){
			this.apiCall(
				"diputados",
				{only:'["id","cargos_congreso"]'}, 
				function(_data){this.cargos_dipus = _data;});	
		},

		routes:{
			'' : 'basicaHandler',
			'(filter/:fil)' : 'intervencionesHandler'
		},
	
		basicaHandler: function(){
			if(!this.diputados || !this.comisiones){
				setTimeout(this.basicaHandler,2000);
				return;
			}

			urlApi='http://api.quehacenlosdiputados.net/intervenciones?order={"fechahora":-1}&limit=30&count=1';
                        $.when(
                                $.ajax(urlApi)
                        ).done(function(_data){
                                var nuevas=_data.result;
				var total=_data.totalObjects;
                                var htmlInterv=htmlIntervenciones(nuevas);

                                //$('#ordenes option[value="'+ord+'"]').attr("selected","selected");
                                
				$('.intervenciones').html(htmlInterv);
				if(nuevas.length == 30){
					$('#intervencionesdiv').append(enlacesFinalInterv());
				}else{ 
					$('#intervencionesdiv').append(enlaceVolverArriba());
				}
				$('h3.title').text(total+' intervenciones');
				$('h3.title').show();
                                $('#intervenciones').show();
                        });

		},

		intervencionesHandler: function(fil){
			if(!this.diputados || !this.comisiones){
				setTimeout(this.intervencionesHandler,2000,fil);
				return;
			}

			// Comprobamos validez de url
			/*var urlValida=true;
			if(fil== null){
				urlValida=false;
			}

			else{
				// Comprobamos que fil es válido
				var valid=validParams(fil);
				if(valid === false){
					urlValida=false;
				}
			}
		
			// Si la url no es válida, no seguimos
			if(urlValida==false){
				window.location.href='/404';
				//alert('url no válida');
				return;
			}*/
			
			var filtros=fil.split('&');
			urlApi=filtrosInicApiUrl(filtros);
			urlApi+="&count=1";
			$.when(
                		$.ajax(urlApi)
         		).done(function(_data){
                		var nuevas=_data.result;
				var totalInic=_data.totalObjects;
				var htmlInterv=htmlIntervenciones(nuevas);
				
				$('#filtrosActivos').html(dibujaFiltrosActivos());
				
				$('.filtro option[value="no"]').prop("selected",true);
				
				//$('#ordenes option[value="'+ord+'"]').attr("selected","selected");
				$('.intervenciones').html(htmlInterv);
				$('h3.title').text(totalInic+' intervenciones');
				$('h3.title').show();

				
				if($('#volverarriba').length == 0){
					$('#intervencionesdiv').append(enlacesFinalInterv());
				}
				if(nuevas.length == 30){
					$('#volverarriba a').show();
					$('#cargarmas').css('visibility','visible');	
				}else{
					$('#cargarmas').css('visibility','hidden');
					if(nuevas.length > 15){
						$('#volverarriba a').show();
					}else{
						$('#volverarriba a').hide();
					}
				}
                	});

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
