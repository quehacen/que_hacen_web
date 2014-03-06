/*
(function(_){
	_.miFiltro = function(){
		console.log('filtro');
		return 'filtro';
	}
})(_);*/

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

function templateDipu(sub){
	//var template='<ol class="diputados">
	var template='{{#data}}<li class="diputado">';
	template+='<a href="/diputado/{{normalized.url}}" title="Ver ficha de {{nombre}} {{apellidos}}">';
	template+='<span class="fotoimg"><img src="/img/imagenesDipus/{{id}}.jpg" alt="Fotografía de {{nombre}} {{apellidos}}"></span>';
	template+='<span class="nombre"><b>{{apellidos}}</b>, {{nombre}}</span><img class="partidoimg" src="/img/logosPartidos/{{partido }}.png" alt="logotipo del partido {{partido}}"></span>';
	template+='</a>';
	switch(sub){
		case 'edad': txtsub='{{edad}} años';break;
		case 'twitter': txtsub='';break;
		case 'facebook': txtsub='';break;
		case 'correo': txtsub='';break;
		case 'sueldo':txtsub='<a href="/diputado/{{normalized.url}}/salario">{{sueldo.bruto_mes}} €/mes</a>';break;	
		case 'inic': txtsub='{{inic}} iniciativas';break;
		case 'interv': txtsub='{{interv}} intervenciones';break;
		case '': txtsub='G.P. {{grupo}}';break;
		default: txtsub='{{'+sub+'}}';break;
	}
	template+='<span class="subt">'+txtsub+'</span>';
	template+='</li>{{/data}}';
	//template+='</ol>';
	return template;
}

$(function(){
	var Router = Backbone.Router.extend({
		diputados: null,
		initialize: function(){
			this.apiCall({q:'{"activo":1}',order:'{"nombre":1}',only:'["id","nombre","apellidos","fecha_nac","grupo","partido","normalized","contacto","sueldo.bruto_mes","actividad.iniciativas","actividad.intervenciones.total"]'}, function(_data){
				this.diputados = _data;
				//alert('we have dipus!');
			});
		},
		routes:{
			//'' : 'nombreHandler',
			//'orden/:ord' : 'ordenHandler',
			'edad': 'edadHandler',
			'salario': 'sueldoHandler',
			'interv': 'intervHandler',
			'inic': 'inicHandler',
			
		},

		edadHandler: function(){
			//alert('HOME');
			if(!this.diputados){
				setTimeout(this.edadHandler, 500);
				return;
			}
			
			var porEdad=[];
			if(typeof(diputados[0].edad) == "undefined"){
				_.each(diputados,function(dipu){
					dipu.edad=edad(dipu.fecha_nac);
				});
			}
			porEdad.data= _.sortBy(diputados, function(dipu){ return dipu.edad; });
			var template = templateDipu('edad');
			//$('#tabsComisiones').html(tagsCom("nombre"));
			$('.diputados').html( Mustache.render(template, porEdad) );
		},
	
		sueldoHandler: function(){
			if(!this.diputados){
				setTimeout(this.sueldoHandler, 500);
				return;
			}
			var porSueldo=[];
			porSueldo.data= _.sortBy(diputados, function(dipu){ return dipu.sueldo.bruto_mes; });
			var template = templateDipu('sueldo');
			//$('#tabsComisiones').html(tagsCom("nombre"));
			$('.diputados').html( Mustache.render(template, porSueldo) );
		},
	
		inicHandler: function(){
			if(!this.diputados){
				setTimeout(this.inicHandler, 500);
				return;
			}
			var porInic=[];
			
			if(typeof(diputados[0].inic) == "undefined"){
				_.each(diputados,function(dipu){
					dipu.inic=dipu.actividad[0].iniciativas.total;
				});
			}
			porInic.data= _.sortBy(diputados, function(dipu){ return dipu.inic; });
			var template = templateDipu('inic');
			//$('#tabsComisiones').html(tagsCom("nombre"));
			$('.diputados').html( Mustache.render(template, porInic) );
		},
		
		intervHandler: function(){
			if(!this.diputados){
				setTimeout(this.intervHandler, 500);
				return;
			}

			if(typeof(diputados[0].inic) == "undefined"){
				_.each(diputados,function(dipu){
					dipu.interv=dipu.actividad[0].intervenciones.total;
				});
			}
			var porInterv=[];
			porInterv.data= _.sortBy(diputados, function(dipu){ return dipu.actividad[0].intervenciones.total; });
			var template = templateDipu('interv');
			//$('#tabsComisiones').html(tagsCom("nombre"));
			$('.diputados').html( Mustache.render(template, porInterv) );
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

		},
		fechaConstHandler:function(){	
			if(!this.comisiones){
				setTimeout(this.fechaConstHandler,500);
				return;
			}
		
			var ordenadas=[];
			var datos=_.sortBy(this.comisiones, function(com){
				var nums=com.constituida.split('/');
				var fecha= new Date(nums[2],nums[1],nums[0]);  
				var time=fecha.getTime();
				//console.log(fecha.getTime());
				return time;
				//return fecha.getMilliseconds(); 
			});
			ordenadas.data=datos;
			var template = "<table>{{#data}}<tr><td><a href='organo/{{normalized.url}}'>{{nombre}}</a> ({{constituida}})</td></tr> {{/data}} </table>";
			$('#tabsComisiones').html(tagsCom("fechaConst"));
			$('.containerComisiones').html( Mustache.render(template, ordenadas) );
		},*/
		apiCall: function(_data, callback){
			$.ajax({
				url:'http://api.quehacenlosdiputados.net/diputados',
				//url:'http://localhost:3002/organos',	
				//url:'http://quehacenlosdiputados.net:quehacenT3ST@api.quehacenlosdiputados.net/organos',
				//username: 'quehacenlosdiputados.net',
				//password: 'quehacenT3ST',
				/*beforeSend: function (xhr){ 
        			 xhr.setRequestHeader('Authorization', make_base_auth("quehacenlosdiputados.net","quehacenT3ST")); 
    				},
				headers: {Authorization: make_base_auth("quehacenlosdiputados.net","quehacenT3ST")},*/
				data : _data
			}).done(function(result){
				callback(result);
			});
		},
		apiDipusCall: function(_data, callback){
			$.ajax({
				url:'http://api.quehacenlosdiputados.net/diputados',
				data : _data
			}).done(function(result){
				callback(result);
			});
		}
	});

	var router = new Router();
	Backbone.history.start();
});
