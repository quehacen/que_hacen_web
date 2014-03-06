$(document).ready(function(){
  // ajax query
  /*$.ajax({
	url:'http://api.quehacenlosdiputados.net/circunscripciones',
        data: 'order={"nombre":1'}
  }).done(function(result){
        this.datos=result;
  });*/

  var widthDiputados = $('.diputados .diputado').length * 120;
  $('.diputados').css('width',widthDiputados);

  new SpainMap({
    id: 'map',
    width: 600,
    height: 600,
    fillColor: "#eeeeee",
    strokeColor: "#cccccc",
    strokeWidth: 0.7,
    selectedColor: "#fe5339",
    hoverColor: "#fe9f81",
    animationDuration: 200,
    onClick: function(province, event ) {
      $.getJSON("http://api.quehacenlosdiputados.net/circunscripcion/"+province.number,function(data){
      $.getJSON('http://api.quehacenlosdiputados.net/diputados?q={"circunscripcion":"'+province.name+'","baja":{"$exists":false}}&only=["id","nombre","apellidos","grupo","partido","normalized","activo"]',function(data2){
      	var diputados=data2;
	var provincia=data;
	var title="<a href='/circunscripcion/"+provincia.normalized.url+"' title='Ver ficha completa de "+provincia.nombre+"'>"+provincia.nombre+"</a>";
	//$('#info .title').text(provincia.nombre);
	$('#info .title').html(title);     
	$('#info .total_escanos').text(provincia.total_escanos+' escaños');
        //add tabla votos totales
        var datosT1 = [];
        datosT1['total_votos'] = "Votos totales";
        datosT1['abstencion'] = "Abstención";
        datosT1['nulos'] = "Votos nulos";
        datosT1['blancos'] = "Votos en blanco";
        var tabla1 = "<table><tbody>";
        $.each(provincia.totales_votacion,function(key,dato){
          tabla1 += "<tr>";
          tabla1 += "<th>"+datosT1[dato.tipo]+"</th>";
          tabla1 += "<td>"+dato.votos+"</td>";
          tabla1 += "<td>"+dato.porcentaje+"</td>";
          tabla1 += "</tr>";
        })
        tabla1 += "</tbody></table>";
        $('#info .tabla1').empty();
        $('#info .tabla1').append(tabla1);

        //add tabla desglose
        var tabla2 = "<table><thead><tr><th>Formación</th><th>Votos</th><th>Porcentaje</th><th>Escaños</th></tr></thead><tbody>";
        $.each(provincia.desglose_votacion,function(key,dato){
          tabla2 += "<tr>";
          tabla2 += "<td>"+dato.formacion+"</td>";
          tabla2 += "<td>"+dato.votos+"</td>";
          tabla2 += "<td>"+dato.porcentaje+"</td>";
          if(dato.escanos){
            tabla2 += "<td>"+dato.escanos+"</td>";
          }else{
            tabla2 += "<td>0</td>";
          }
          tabla2 += "</tr>";
        })
        tabla1 += "</tbody></table>";

	//ad info diputados
	var dipusdiv="";
	var cont=0;
        _.each(diputados,function(dipu){
	    if(dipu.activo == 1){
	      if(cont<8){
		dipusdiv+="<li class='diputado'>";
		dipusdiv+="<a href='/diputado/"+dipu.normalized.url+"' title='Ver ficha de "+dipu.nombre+" "+dipu.apellidos+"'>";
		dipusdiv+="<span class='fotoimg'><img src='/img/imagenesDipus/"+dipu.id+".jpg' alt='Fotografia de "+dipu.nombre+" "+dipu.apellidos+"'/></span>";
		dipusdiv+="<span class='nombre'><b>"+dipu.nombre+" "+dipu.apellidos+"</b></span>";
		dipusdiv+="<img class='partidoimg' src='/img/logosPartidos/"+dipu.partido+".png' alt='Logo del partido"+dipu.partido+"'/>";
		dipusdiv+="</a>";
		//dipusdiv+="<a href='/grupo-parlamentario/"+dipu.grupo+"'>";
		//dipusdiv+="<span class='grupo'>G.P. "+dipu.grupo+"</span>";
		dipusdiv+="</li>";
		//dipusdiv+="</a></li>";
		cont++;
	      }else{
		cont=9;
		return false;
	      }	
	   }
	});
	dipusdiv+="</ol>";
	
	if(cont==9){
		dipusdiv+="<p style='text-align:center'><a href='/circunscripcion/"+provincia.normalized.url+"'>Ver todos</a></p>";
	}
	
        $('#info .diputados').empty();
        $('#info .diputados').append(dipusdiv);

        $('#info .tabla2').empty();
        $('#info .tabla2').append(tabla2);

        $('#info').addClass("active");
        $('#diputados').addClass("active");	
        //$('#verdatos').addClass("active");
      });
      });
    },
    onMouseOver: function(province, e) {
        //$('#tooltip').fadeIn("fast").text(province.name).css('left',e.pageX).css('top',e.pageY);
    },
    onMouseOut: function(province, e) {
        //$('#tooltip').fadeOut("fast").text('');
    },
  });
	
  $('#verdipus').click(function(){
	if($(this).hasClass('active')!=true){
		$("#datos_elecciones").removeClass("active");	
        	$('#verdatos').removeClass("active");
		$("#diputados_").addClass("active");
        	$('#verdipus').addClass("active");
		$('#datos_elecciones').hide();
		$('#diputados_').show();
	}
  });
  
  $('#verdatos').click(function(){
	if($(this).hasClass('active')!=true){
		$("#diputados_").removeClass("active");	
        	$('#verdipus').removeClass("active");
        	$('#verdatos').addClass("active");
		$("#datos_elecciones").addClass("active");
		$('#diputados_').hide();
		$('#datos_elecciones').show();
	}
  });
});
