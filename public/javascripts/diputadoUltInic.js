function enlaceInic(numExp){
        var nums=numExp.split('/');
        return "http://www.congreso.es/portal/page/portal/Congreso/Congreso/Iniciativas?_piref73_2148295_73_1335437_1335437.next_page=/wc/servidorCGI&CMD=VERLST&BASE=IW10&FMT=INITXDSS.fmt&DOCS=1-3&DOCORDER=FIFO&OPDEF=ADJ&QUERY=%28"+nums[0]+"%2F"+nums[1]+"*.NDOC.%29";
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

        _.each(idsTiposInic[tipoCat],function(tipoInic){
                tiposInic.push(tipoInic);});
                
	tipoQuery='"tipo":{"$in":[';

        _.each(tiposInic,function(tipoInic){
                tipoQuery+=tipoInic+","; });
        tipoQuery=tipoQuery.substring(0,tipoQuery.length-1);
        tipoQuery+=']}';
        return tipoQuery;
}

function ultimasInicDipu(dipu,tipo){
	if(tipo=="TODAS"){
		var query='q={"tipo_autor":"Diputado","autores":{"$in":['+dipu+']}}';
	}else{
		var tipoQuery=tipoCatQuery(tipo);
		var query='q={"tipo_autor":"Diputado","autores":{"$in":['+grupo+']},'+tipoQuery+'}';
	}
	var apiUrl='http://api.quehacenlosdiputados.net/iniciativas?'+query+'&order={"presentadoJS2":-1}&limit=3';

	$.when(
                $.ajax(apiUrl)
         ).done(function(_data){
                var nuevas=_data;
                var masInic="";
		if(nuevas.length > 0){
                   _.each(nuevas,function(inic){
                        var urlInic=enlaceInic(inic.num_expediente);
                        masInic+='<li class="iniciativa"><a target="_blank" href="'+urlInic+'"><i class="fa fa-circle"> </i> '+inic.titulo+'</a>';
                        //masInic+='<li class="iniciativa"><a><i class="fa fa-circle"> </i> '+inic.titulo+'</a>';
                        masInic+='<span>Presentada el '+inic.presentado+', calificada el '+inic.calificado+'</span>';
                        /*if(inic.autores.length==1){
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
                        }*/

                        if(typeof(inic.resultado_tramitacion) != "undefined"){
                                masInic+='<span>Estado: '+inic.resultado_tramitacion+'</span>';
                        }else{
                                masInic+='<span>Estado: En tramitación</span>';
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
		$('.tiposUltimasInic a.active').removeClass('active');
		$('#'+tipo+'i').addClass('active');
        });
}

