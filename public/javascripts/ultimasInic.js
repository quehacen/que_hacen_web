function enlaceInic(numExp){
        var nums=numExp.split('/');
        return "http://www.congreso.es/portal/page/portal/Congreso/Congreso/Iniciativas?_piref73_2148295_73_1335437_1335437.next_page=/wc/servidorCGI&CMD=VERLST&BASE=IW10&FMT=INITXDSS.fmt&DOCS=1-3&DOCORDER=FIFO&OPDEF=ADJ&QUERY=%28"+nums[0]+"%2F"+nums[1]+"*.NDOC.%29";
}

function tipoTramit(tipo){
        switch(tipo){
                case "Aprobado con modificaciones":
                case "Aprobado sin modificaciones":
                case "Convertido":
                case "Subsumido en otra iniciativa":
                case "Tramitado por completo sin req. acuerdo o decisión":
                        return "exito";
                case "Caducado":
                case "Decaído":
                case "Extinguido por desaparición o cese del autor":
                case "Inadmitido a trámite con recalificación":
                case "Inadmitido a trámite en términos absolutos":
                case "No celebración":
                case "Rechazado":
                case "Retirado":
                        return "noexito";
                default:
                        return "entramit";
        }
}


function tipoCatQuery(tipoCat){
        var tipoQuery;
        var tiposInic=[];
        var idsTiposInic={};

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
        idsTiposInic["SOLIC"] = [];
        idsTiposInic["SOLIC"] = idsTiposInic["SOLIC"].concat(idsTiposInic["SOLIC_NO"],idsTiposInic["SOLIC_COMP"],idsTiposInic["SOLIC_INF"]);
        idsTiposInic["OTROS"] = [];
        idsTiposInic["OTROS"] = idsTiposInic["OTROS"].concat(idsTiposInic["SOLIC"],idsTiposInic["INTERP"],idsTiposInic["MOC"],idsTiposInic["PL"],idsTiposInic["PNL"]);

        _.each(idsTiposInic[tipoCat],function(tipoInic){
                tiposInic.push(tipoInic);});
                
        if(tipoCat=="OTROS"){
                tipoQuery='"tipo":{"$nin":[';
        }else{  
                tipoQuery='"tipo":{"$in":[';
        }

        _.each(tiposInic,function(tipoInic){
                tipoQuery+=tipoInic+","; });
        tipoQuery=tipoQuery.substring(0,tipoQuery.length-1);
        tipoQuery+=']}';
        return tipoQuery;
}

function ultimasInicGrupo(autor,tipo){
	ultimasInic("Grupo",autor,tipo);
}

function ultimasInicDipu(autor,tipo){
	ultimasInic("Diputado",autor,tipo);
}

function ultimasInic(tipoAutor,autor,tipo){
	if(tipo=="TODAS"){
		var query='q={"tipo_autor":"'+tipoAutor+'","autores":{"$in":['+autor+']}}';
	}else{
		var tipoQuery=tipoCatQuery(tipo);
		var query='q={"tipo_autor":"'+tipoAutor+'","autores":{"$in":['+autor+']},'+tipoQuery+'}';
	}
	var apiUrl='http://api.quehacenlosdiputados.net/iniciativas?'+query+'&order={"presentadoJS2":-1}&limit=3';

	$.when(
                $.ajax(apiUrl)
         ).done(function(_data){
                var nuevas=_data.result;
                var masInic="";
		if(nuevas.length > 0){
                   _.each(nuevas,function(inic){
			var urlInic=enlaceInic(inic.num_expediente);
                        enlaceExt='<a class="enlaceExtIcon" href="'+urlInic+'" target="_blank" title="Ver ficha de la iniciativa en Congreso.es" ><i class="fa fa-external-link"> </i></a>';
                        masInic+='<li class="iniciativa"><span class="tituloInic"><i class="fa fa-circle" style="display:inline-block"> </i> '+inic.titulo+' '+enlaceExt+'</span>';
                        masInic+='<span>Presentada el '+inic.presentado+', calificada el '+inic.calificado+'</span>';
                       
			if(typeof(inic.resultado_tramitacion) != "undefined"){
                                var tipoRes=tipoTramit(inic.resultado_tramitacion);
                                var icono;
                                if(tipoRes=="exito"){
                                        icono="fa-thumbs-up";
                                }else{
                                        icono="fa-thumbs-down";
                                }
                                masInic+='<span class="tramit '+tipoRes+'"><i class="fa '+icono+'"> </i> '+inic.resultado_tramitacion+'</span>';
                        }else{
                                masInic+='<span class="tramit entramit"><i class="fa fa-clock-o"> </i> En tramitación</span>';
                        }

                        masInic+='</li>';
                   });
                   //$(masInic).hide().appendTo(".iniciativas").fadeIn(1500);
                   //$('.iniciativas').html(masInic);
                   /*if(nuevas.length == 3){
                        var verMas='<span><a href="/iniciativas#filter/grupo='++'&tipoCat='+tipo+'">Ver más</a></span>';
                        masInic+=verMas);
                   }else{

		   }*/
                   $('.iniciativas').html(masInic);
		}else{
		   var sinInic="<span style='font-size:11pt;display:block;text-align:center;padding:50px 0px;'>Sin iniciativas de este tipo</span>";
                   $('.iniciativas').html(sinInic);
		}
		$('.tiposUltimasInic li.active').removeClass('active');
		$('#'+tipo+'i').parent().addClass('active');
        });
}

