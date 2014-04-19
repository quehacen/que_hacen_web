function edad(fechanac) {
	var date = fechanac;
	var nums = date.split('/');
	var nac= new Date(nums[2],nums[1],nums[0]);
	var hoy=new Date();
	return parseInt((hoy - nac)/365/24/60/60/1000);
}

function textToApi(text){
	var cambios={"a":"[aáäâ]","e":"[eèé]","i":"[iíì]","o":"[oóò]","u":"[uúùü]"};
	for(var cambio in cambios){
		text=text.replace(new RegExp(cambio, 'g'), cambios[cambio]);
	}
	return text;
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

function busquedaTextoInic(){
	var texto=$('.filtrosContainer #textoBusc').val().replace(/\s+/g, ' ').trim();
	if(texto=="" || texto==" "){
		alert("El campo de búsqueda está vacío.");
	}
	var textoNorm= texto.replace('"',"\"");
	//alert(texto);
	anadeFiltro(textoNorm,"texto");
}


function tipoGlobalTramit(filtro){
	switch(filtro){
		case 'CAD': case 'D': case 'EDCA': case 'ITR': case 'ITTA': case 'NC': case 'RECH': case 'RET':
			return 'NEXITO'; break; 
		case 'ACM': case 'ASM': case 'CONV': case 'SOA': case 'TCSRAD': 
			return 'EXITO'; break;
		default:
			return ''; break;	
	}
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

function filtroAutorTodos(filtros){
	var autor='';
	_.each(filtros,function(filtro){
		if(filtro=="grupo=todos"){
			autor="grupo";
		}else if(filtro=="diputado=todos"){
			autor="diputado";
		}
	});
	if (autor=='') return false;
	return autor;
}

function filtroAutor(filtros){
	var autor=false;
	_.each(filtros,function(filtro){
		if(filtro.indexOf("grupo=")==0){
			autor="grupo";
		}else if(filtro.indexOf("diputado=")==0){
			autor="diputado";
		}
	});
	return autor;
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
			
		
		// Si es un filtro de los que se comportan como OR, hay que procesar de forma diferente
		}else if(filtro.indexOf(tipoFiltro+"-") == 0){
			var arrayFiltrosTipo=getFiltrosTipo(arrayFil,tipoFiltro);
			var filVal=filtro.substr(tipoFiltro.length+1);
			var autorTodos=filtroAutorTodos(arrayFil);
			var tramitGlobal=filtroTramitGlobal(arrayFil);
			//alert(tipoGlobalTramit(filVal));
			// Si el filtro ya está añadido, informamos y no hacemos nada
			if(_.contains(arrayFiltrosTipo,filVal)){
				alert('Ese filtro ya está seleccionado');
				$('#'+tipoFiltro+' option[value="no"]').prop("selected",true);	
				return false;
			// Procesamiento para casos especiales de autor
			}else if(tipoFiltro=="diputado" && autorTodos=="diputado"){
				filtros="filter/diputado="+filVal+"&";
				_.each(arrayFil,function(filAnt){
					if(filAnt.indexOf("diputado=")!=0){
						filtros+=filAnt+"&";
					}
				});
				filtros=filtros.substring(0,filtros.length-1);
			}else if(tipoFiltro=="grupo" && autorTodos=="grupo"){
				filtros="filter/grupo="+filVal+"&";
				_.each(arrayFil,function(filAnt){
					if(filAnt.indexOf("grupo=")!=0){
						filtros+=filAnt+"&";
					}
				});
				filtros=filtros.substring(0,filtros.length-1);

			// Procesamiento para casos especiales de tramitación (globales)
			}else if(filtro=="tramit-EXITO" || filtro=="tramit-NEXITO"){
				var filsTramit="tramit="+filVal+'+';
				if(arrayFiltrosTipo.length!=0){
					_.each(arrayFiltrosTipo,function (filTramit){
						if(tipoGlobalTramit(filTramit)!=filVal){
							filsTramit+=filTramit+'+';
						}
					});
				}
				filsTramit=filsTramit.substring(0,filsTramit.length-1);
				filtros="filter/";
				_.each(arrayFil,function(filAnt){
					if(filAnt.indexOf("tramit=")!=0){
						filtros+=filAnt+"&";
					}else{
						filtros+=filsTramit+"&";
					}
				});
				filtros=filtros.substring(0,filtros.length-1);
				if(arrayFiltrosTipo.length==0) filtros+="&"+filsTramit;
			}else if(tipoFiltro=="tramit" && (tipoGlobalTramit(filVal)=="EXITO" && _.contains(arrayFiltrosTipo,"EXITO")==true || tipoGlobalTramit(filVal)=="NEXITO" && _.contains(arrayFiltrosTipo,"NEXITO")==true) ){
				var filsTramit="tramit="+filVal+'+';
				var tipoTramit=tipoGlobalTramit(filVal);
				if(arrayFiltrosTipo.length!=0){
					_.each(arrayFiltrosTipo,function (filTramit){
						if(filTramit!=tipoTramit){
							filsTramit+=filTramit+'+';
						}
					});
				}
				filsTramit=filsTramit.substring(0,filsTramit.length-1);
				filtros="filter/";
				_.each(arrayFil,function(filAnt){
					if(filAnt.indexOf("tramit=")!=0){
						filtros+=filAnt+"&";
					}else{
						filtros+=filsTramit+"&";
					}
				});
				filtros=filtros.substring(0,filtros.length-1);	
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
	var excluyentes = ["individual","compartida"];
	var excluyentesAsoc = ["compartida","individual"];
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
			//alert(filtro);
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
	var orden='';
	var url,tipos;
	var grupoFiltro='';
	var filtros="filter/";

	$('.filtro').each(function(){
		if(filtro.indexOf($(this).attr('id')) == 0 ){
			grupoFiltro=$(this).attr('id');
		}
	});

	if(grupoFiltro==''){
		alert(filtro);	
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
		//alert(filtros);
		if(orden==''){
			url=filtros;
		}else{
			url=orden+'/'+filtros;
		}
	}else{
		url=orden;
	}

	if(url=="") window.location.href="iniciativas";
	window.location.href="iniciativas#"+url;
}

function cambiaFiltro(filtro){
	var tipoFiltro=$('.filtro option[value="'+filtro+'"]').parent().attr("id");
	anadeFiltro(filtro,tipoFiltro);
}

function anadeFiltro(filtro,tipoFiltro){
	var url=anadirFiltroUrl(filtro,tipoFiltro);
	if(url!=false) window.location.href="iniciativas#"+url;
}

function filtrosInicApiUrl(filtros){
	var tipoAutor="";
	var tiposInic=[];
	var idsTiposInic={};
	var resulsTramit={};

	// Categorías de iniciativas
	// Inic de diputados
	idsTiposInic["PESC"] = [179,184];
	idsTiposInic["PORAL"] = [178,181,180];
	idsTiposInic["SOLIC_NO"] = [155,156,157,158];
	idsTiposInic["SOLIC_COMP"] = [62,210,211,212,213,214,215,216,217,218,219,220,221,222,223];
	idsTiposInic["SOLIC_INF"] = [186,187,188,189,190,191,192,193,194,195,196,197];
	// Inic de grupos
	idsTiposInic["PNL"] = [162,161];
	idsTiposInic["PL"] = [122,123,124];
	idsTiposInic["MOC"] = [171,173,82,84];
	idsTiposInic["INTERP"] = [170,172];
	// Probar [].concat
	idsTiposInic["SOLIC"] = [];
	idsTiposInic["SOLIC"] = idsTiposInic["SOLIC"].concat(idsTiposInic["SOLIC_NO"],idsTiposInic["SOLIC_COMP"],idsTiposInic["SOLIC_INF"]);
	idsTiposInic["OTROS"] = [];
	idsTiposInic["OTROS"] = idsTiposInic["OTROS"].concat(idsTiposInic["SOLIC"],idsTiposInic["INTERP"],idsTiposInic["MOC"],idsTiposInic["PL"],idsTiposInic["PNL"]);

	// Resultados de tramitación
        resulsTramit["ACM"]="Aprobado con modificaciones";
	resulsTramit["ASM"]="Aprobado sin modificaciones";
	resulsTramit["CONV"]="Convertido";
	resulsTramit["SOA"]="Subsumido en otra iniciativa";
	resulsTramit["TCSRAD"]="Tramitado por completo sin req. acuerdo o decisión";
	resulsTramit["CAD"]="Caducado"
	resulsTramit["D"]="Decaído";
	resulsTramit["EDCA"]="Extinguido por desaparición o cese del autor";
	resulsTramit["ITR"]="Inadmitido a trámite con recalificación";
	resulsTramit["ITTA"]="Inadmitido a trámite en términos absolutos";
	resulsTramit["NC"]="No celebración";
	resulsTramit["RECH"]="Rechazado";
	resulsTramit["RET"]="Retirado";
	resulsTramit["EXITO"]=[resulsTramit["ACM"],resulsTramit["ASM"],resulsTramit["CONV"],resulsTramit["SOA"],resulsTramit["TCSRAD"]];
	resulsTramit["NEXITO"]=[resulsTramit["CAD"],resulsTramit["D"],resulsTramit["EDCA"],resulsTramit["ITR"],resulsTramit["ITTA"],resulsTramit["NC"],resulsTramit["RECH"],resulsTramit["RET"]];
	

	var q="q={";
	var qs=[];
	var valFil;
	var apiUrl='http://api.quehacenlosdiputados.net/iniciativas?';
	_.each(filtros,function(filtro){
	   if(filtro.indexOf("grupo=")==0){
		qs.push('"tipo_autor":"Grupo"');
		valFils=filtro.substr(6).split('+');
		
		if(valFils!="todos"){
			var autoresQuery='"autores":{"$in":[';
			_.each(valFils,function(valFil){
				autoresQuery+=valFil+","
			});
			autoresQuery=autoresQuery.substring(0,autoresQuery.length-1);
			autoresQuery+=']}';
			qs.push(autoresQuery);
		}
	   }else if(filtro.indexOf("diputado=")==0){
		qs.push('"tipo_autor":"Diputado"');
		valFils=filtro.substr(9).split('+');
		if(valFils!="todos"){
			var autoresQuery='"autores":{"$in":[';
			_.each(valFils,function(valFil){
				autoresQuery+=valFil+","
			});
			autoresQuery=autoresQuery.substring(0,autoresQuery.length-1);
			autoresQuery+=']}';
			qs.push(autoresQuery);
		}
		
	   }else if(filtro.indexOf("tipoCat=")==0){
		var otros=false;
		valFils=filtro.substr(8).split('+');
		_.each(valFils,function(valFil){
			if(valFil=="OTROS"){
				//tipoQuery='"tipo":{"$nin":[';
			}else{
				_.each(idsTiposInic[valFil],function(tipoInic){
					tiposInic.push(tipoInic);
				});
			}
		});
		
		// OTROS tipoQuery='"tipo":{"$nin":[';
		tipoQuery='"tipo":{"$in":[';	
		_.each(tiposInic,function(tipoInic){
			tipoQuery+=tipoInic+",";
		});
		
		tipoQuery=tipoQuery.substring(0,tipoQuery.length-1);
		tipoQuery+=']}';
		qs.push(tipoQuery);

	   }else if(filtro.indexOf("tramit=")==0){
		tramits=[];
		valFils=filtro.substr(7).split('+');
		_.each(valFils,function(valFil){
			if(valFil=="EXITO" || valFil=="NEXITO"){
				_.each(resulsTramit[valFil],function(resulTramit){
					tramits.push(resulTramit);
				});
			}else{
				tramits.push(resulsTramit[valFil]);
			}
		});
		
		tramitQuery='"resultado_tramitacion":{"$in":[';
		_.each(tramits,function(tramit){
			tramitQuery+='"'+tramit+'",';
		});
		
		tramitQuery=tramitQuery.substring(0,tramitQuery.length-1);
		tramitQuery+=']}';
		qs.push(tramitQuery);


	   }else if(filtro.indexOf("texto=")==0){
		var textoQuery='"titulo":"';
		var textoNorm=textToApi(filtro.substr(6).replace(/\+/g,' '));
		textoQuery+=textoNorm;
		textoQuery+='"';
		qs.push(textoQuery);

	   }else{
		if(filtro=="individual"){
			qs.push('"autores.1":{"$exists":false}');
		}else if(filtro=="compartida"){
			qs.push('"autores.1":{"$exists":true}');
		}
	   }
	
	});

	_.each(qs,function(qsi){
		q+=qsi+",";
	});
	
	q=q.substring(0,q.length-1);
	q+="}";

	if(qs.length!=0){
		apiUrl+=q+'&order={"presentadoJS2":-1}&limit=30';
	}else{
		apiUrl+='order={"presentadoJS2":-1}&limit=30';
	}
	//alert(q);
	return apiUrl;
}


function enlacesFinalInic(){
	var enlaces='<span id="volverarriba" class="enlacesfinal" style="display:block;padding:15px;text-align:center"><a style="font-size:11pt;" href="javascript:$(\'html\')[0].scrollIntoView( true );">Volver arriba</a></span>';
	enlaces+='<span id="cargarmas" class="enlacesfinal"><a href="javascript:skipIniciativas(1)">Cargar más</a></span>';
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

function selectInic(tipoAutor){
	var select='<option class="titleSelect" disabled selected value="no">Tipo de iniciativa</option>';
	if(tipoAutor=="todos"){
		select+='<option value="tipoCat-INTERP">Interpelación</option>';
             	select+='<option value="tipoCat-MOC">Moción</option>';
                select+='<option value="tipoCat-PESC">Pregunta escrita</option>';
                select+='<option value="tipoCat-PORAL">Pregunta oral</option>';
                select+='<option value="tipoCat-PL">Proposición de Ley</option>';
                select+='<option value="tipoCat-PNL">Proposición no de ley</option> ';
                select+='<option value="tipoCat-SOLIC">Solicitudes (todas)</option>';
                select+='<option value="tipoCat-SOLIC_COMP">Solicitud de comparecencia</option>';
                select+='<option value="tipoCat-SOLIC_NO">Solicitud de nuevo órgano</option>';
                select+='<option value="tipoCat-SOLIC_INF">Solicitud de informe</option>';
	}else if(tipoAutor=="grupo"){
		select+='<option value="tipoCat-INTERP">Interpelación</option>';
             	select+='<option value="tipoCat-MOC">Moción</option>';
                select+='<option value="tipoCat-PL">Proposición de Ley</option>';
                select+='<option value="tipoCat-PNL">Proposición no de ley</option> ';
                select+='<option value="tipoCat-SOLIC">Solicitudes (todas)</option>';
                select+='<option value="tipoCat-SOLIC_COMP">Solicitud de comparecencia</option>';
                select+='<option value="tipoCat-SOLIC_NO">Solicitud de nuevo órgano</option>';
                select+='<option value="tipoCat-SOLIC_INF">Solicitud de informe</option>';
	}else if(tipoAutor=="diputado"){
                select+='<option value="tipoCat-PESC">Pregunta escrita</option>';
                select+='<option value="tipoCat-PORAL">Pregunta oral</option>';
                select+='<option value="tipoCat-SOLIC">Solicitudes (todas)</option>';
                select+='<option value="tipoCat-SOLIC_COMP">Solicitud de comparecencia</option>';
                select+='<option value="tipoCat-SOLIC_NO">Solicitud de nuevo órgano</option>';
                select+='<option value="tipoCat-SOLIC_INF">Solicitud de informe</option>';
	}
	return select;
}

function htmlIniciativas(iniciativas){      
	var masInic="";
        _.each(iniciativas,function(inic){
			var urlInic=enlaceInic(inic.num_expediente);
                        masInic+='<li class="iniciativa"><a target="_blank" href="'+urlInic+'"><i class="fa fa-circle"> </i> '+inic.titulo+'</a>';
                        masInic+='<span>Presentada el '+inic.presentado+', calificada el '+inic.calificado+'</span>';
                        if(inic.autores.length==1){
				masInic+="<span>Autor: ";
				if(inic.tipo_autor  == "Diputado"){
					//if(diputados) alert('no tenemos diputados');
					var d=_.find(this.diputados,function(dipu){
						return dipu.id == inic.autores[0];
					});
					masInic+='<a href="/diputado/'+d.id+'">'+d.nombre+' '+d.apellidos+'</a>';
				}else if(inic.tipo_autor == "Grupo"){
					var g=_.find(grupos,function(grupo){
						return grupo.id == inic.autores[0];
					});
					masInic+='<a href="/grupo-parlamentario/'+g.id+'">G.P. '+g.nombre+'</a>';	
				}
				masInic+="</span>";

			}else{
				masInic+="<span>Autores ("+inic.autores.length+"): ";
				if(inic.tipo_autor  == "Diputado"){
					_.each(inic.autores,function(autor){
						var d=_.find(diputados,function(dipu){
							return dipu.id == autor;
						});
						masInic+='<a href="/diputado/'+d.id+'">'+d.nombre+' '+d.apellidos+'</a> ';
					});
				}else if(inic.tipo_autor == "Grupo"){
					_.each(inic.autores,function(autor){
						var g=_.find(grupos,function(grupo){
							return grupo.id == autor;
						});
						masInic+='<a href="/grupo-parlamentario/'+g.id+'">G.P. '+g.nombre+'</a> ';
					});
				}
				masInic+="</span>";
			}
                        if(typeof(inic.resultado_tramitacion) != "undefined"){
                                masInic+='<span>Estado: '+inic.resultado_tramitacion+'</span>';
                        }else{
                                masInic+='<span>Estado: En tramitación</span>';
                        }
                        masInic+='</li>';
                });

         return masInic;
}

function skipIniciativas(nivel){
        var saltar=nivel*30;	
	var url=Backbone.history.fragment;
	var filtrosCad=filtrosURL(url);
	var apiUrl;
	if(filtrosCad==''){
		apiUrl='http://api.quehacenlosdiputados.net/iniciativas?order={"presentadoJS2":-1}&limit=30&skip='+saltar+'';
	}else{
		var filtros=filtrosCad.substr(7).split('&');
		apiUrl= filtrosInicApiUrl(filtros);
		apiUrl+='&skip='+saltar+'';
	}
		
        $.when(
                $.ajax(apiUrl)
         ).done(function(_data){
                var nuevas=_data;
                var masInic="";
                _.each(nuevas,function(inic){
			var urlInic=enlaceInic(inic.num_expediente);
                        masInic+='<li class="iniciativa"><a target="_blank" href="'+urlInic+'"><i class="fa fa-circle"> </i> '+inic.titulo+'</a>';
                        //masInic+='<li class="iniciativa"><a><i class="fa fa-circle"> </i> '+inic.titulo+'</a>';
                        masInic+='<span>Presentada el '+inic.presentado+', calificada el '+inic.calificado+'</span>';
                        if(inic.autores.length==1){
				masInic+="<span>Autor: ";
				if(inic.tipo_autor  == "Diputado"){
					//if(diputados) alert('no tenemos diputados');
					var d=_.find(this.diputados,function(dipu){
						return dipu.id == inic.autores[0];
					});
					masInic+='<a href="/diputado/'+d.id+'">'+d.nombre+' '+d.apellidos+'</a>';
				}else if(inic.tipo_autor == "Grupo"){
					var g=_.find(grupos,function(grupo){
						return grupo.id == inic.autores[0];
					});
					masInic+='<a href="/grupo-parlamentario/'+g.id+'">G.P. '+g.nombre+'</a>';	
				}
				masInic+="</span>";

			}else{
				masInic+="<span>Autores ("+inic.autores.length+"): ";
				if(inic.tipo_autor  == "Diputado"){
					_.each(inic.autores,function(autor){
						var d=_.find(diputados,function(dipu){
							return dipu.id == autor;
						});
						//if(d==null) alert('No se ha encontrado d');
						masInic+='<a href="/diputado/'+d.id+'">'+d.nombre+' '+d.apellidos+'</a> ';
					});
				}else if(inic.tipo_autor == "Grupo"){
					_.each(inic.autores,function(autor){
						var g=_.find(grupos,function(grupo){
							return grupo.id == inic.autores[0];
						});
						masInic+='<a href="/grupo-parlamentario/'+g.id+'">G.P. '+g.nombre+'</a> ';
					});
				}
				masInic+="</span>";
			}
                        if(typeof(inic.resultado_tramitacion) != "undefined"){
                                masInic+='<span>Estado: '+inic.resultado_tramitacion+'</span>';
                        }else{
                                masInic+='<span>Estado: En tramitación</span>';
                        }
                        masInic+='</li>';
                });
                var siguiente=nivel+1;
                var cargarMas='<a href="javascript:skipIniciativas('+siguiente+')">Cargar más</a>';
                $(masInic).hide().appendTo(".iniciativas").fadeIn(1500);
                if(nuevas.length == 30){
                	var cargarMas='<a href="javascript:skipIniciativas('+siguiente+')">Cargar más</a>';
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
        //alert(document.URL);	
	var img="<img style='height:70px;' src='http://www.mo-experts.com/images/loading.gif'/>";
	$('.iniciativas').html(img);
	$('#iniciativasdiv').show();
});

$('#ordenes').change(function() {
	var orden=$('#ordenes option:selected').val();
	var url = anadirOrdenUrl(orden);
	window.location.href="iniciativas#"+url;
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
			'(filter/:fil)' : 'iniciativasHandler'
		},
	
		basicaHandler: function(){
			//alert('sin parámetros');
			if(!this.diputados || !this.grupos){
				setTimeout(this.basicaHandler,2000);
				return;
			}

			urlApi='http://api.quehacenlosdiputados.net/iniciativas?order={"presentadoJS2":-1}&limit=30&count=1';
                        $.when(
                                $.ajax(urlApi)
                        ).done(function(_data){
                                var nuevas=_data.result;
				var total=_data.totalObjects;
                                var htmlInic=htmlIniciativas(nuevas);

                                //$('#ordenes option[value="'+ord+'"]').attr("selected","selected");
                                
				$('.iniciativas').html(htmlInic);
				if(nuevas.length == 30){
					$('#iniciativasdiv').append(enlacesFinalInic());
				}else{ 
					$('#iniciativasdiv').append(enlaceVolverArriba());
				}
				$('h3.title').text(total+' iniciativas');
				$('h3.title').show();
                                $('#iniciativas').show();
                        });

		},

		iniciativasHandler: function(fil){
			//console.log(ord+" "+fil);
			//$('.diputados').hide();
			if(!this.diputados || !this.grupos){
				setTimeout(this.iniciativasHandler,2000,fil);
				return;
			}

			// Comprobamos validez de url
			var urlValida=true;
			if( fil== null){
				urlValida=false;
			}
			/*else{
				// Comprobamos que fil es válido
				var valid=validParams(fil);
				if(valid === false){
					urlValida=false;
				}
			}*/
		
			// Si la url no es válida, no seguimos
			if(urlValida==false){
				window.location.href='/404';
				//alert('url no válida');
				return;
			}
			
			var filtros=fil.split('&');
			urlApi=filtrosInicApiUrl(filtros);
			urlApi+="&count=1";
			$.when(
                		$.ajax(urlApi)
         		).done(function(_data){
                		var nuevas=_data.result;
				var totalInic=_data.totalObjects;
				var htmlInic=htmlIniciativas(nuevas);
				
				$('#filtrosActivos').html(dibujaFiltrosActivos());
				
				$('.filtro option[value="no"]').prop("selected",true);
				$('#textoBusc').val('');
				var autor=filtroAutor(filtros);
				if(autor !== false){
					if(autor=="grupo"){
						// 1er select seleccionado
						$('.filtro#tipo_autor option[value="autor-grupo"]').prop("selected",true);
						//$('.filtro#tipo_autor option[value="autor-diputado"]').css("color","black");	
						// Añadimos select grupo, quitamos select de dipu si lo hay
						$("select#grupo").show();
						$("select#diputado").hide();
						// Actualizamos select de tipo inic
						$("select#tipoCat").html(selectInic("grupo"));
	
					}else if(autor=="diputado"){
						// 1er select seleccionado
						$('.filtro#tipo_autor option[value="autor-diputado"]').prop("selected",true);
						//$('.filtro#tipo_autor option[value="autor-diputado"]').css("font-weight","bold");	
						// Añadimos select dipus, quitamos select de grupos si lo hay
						$("select#diputado").show();
						$("select#grupo").hide();
						// Actualizamos select de tipo inic
						$("select#tipoCat").html(selectInic("diputado"));
					}

				}else{
					$("select#diputado").hide();
					$("select#grupo").hide();
					// Actualizamos select de tipo inic
					$("select#tipoCat").html(selectInic("todos"));
					
				}
				//$('#ordenes option[value="'+ord+'"]').attr("selected","selected");
				$('.iniciativas').html(htmlInic);
				$('h3.title').text(totalInic+' iniciativas');
				$('h3.title').show();
				if($('#volverarriba').length == 0){
					$('#iniciativasdiv').append(enlacesFinalInic());
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
