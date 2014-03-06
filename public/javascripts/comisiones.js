/*
(function(_){
	_.miFiltro = function(){
		console.log('filtro');
		return 'filtro';
	}
})(_);

function make_base_auth(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  return "Basic " + hash;
}*/

function tagsCom(sel){
        var html='';
        var hrefs= ["nombre","numDipus","fechaConst","legislativa","mixta","permanente"];  
        var titulos= ["Nombre","nº diputados","fecha de constitución","Legislativas / No legislativas","Mixtas / No mixtas","Permanentes / no permanentes"];
        for(var i=0;i<3;i++){
                if(hrefs[i]==sel){
                        html=html+'<li class="tab active"><a href="#'+hrefs[i]+'">'+titulos[i]+'</a></li>';
                }else{
                        html=html+'<li class="tab"><a href="#'+hrefs[i]+'">'+titulos[i]+'</a></li>';
                }
        }
        html=html+'<li>|</li>';
        for(var i=3;i<6;i++){
                if(hrefs[i]==sel){
                        html=html+'<li class="tab active"><a href="#'+hrefs[i]+'">'+titulos[i]+'</a></li>';
                }else{
                        html=html+'<li class="tab"><a href="#'+hrefs[i]+'">'+titulos[i]+'</a></li>';
                }
        }
        return html;
}


$(function(){
	var Router = Backbone.Router.extend({
		comisiones: null,
		initialize: function(){
			this.apiCall({q:'{"tipo":"^C"}',order:'{"nombre":1}'}, function(_data){
				this.comisiones = _data;
				//alert('we have comisiones!');
			});
		},
		routes:{
			//'' : 'nombreHandler',
			'nombre' : 'nombreHandler',
			'legislativa': 'legislativaHandler',
			'mixta': 'mixtaHandler',
			'permanente': 'permanenteHandler',
			'numDipus':'numDipusHandler',
			'fechaConst':'fechaConstHandler'
		},

		nombreHandler: function(){
			//alert('HOME');
			if(!this.comisiones){
				setTimeout(this.nombreHandler, 500);
				return;
			}
			var datos=[];
			datos.data=this.comisiones
			var template = "<table>{{#data}} <tr><td><a href='organo/{{normalized.url}}'>{{nombre}}</a></td></tr>{{/data}} </table>";
			$('#tabsComisiones').html(tagsCom("nombre"));
			$('.containerComisiones').html( Mustache.render(template, datos) );
		},

		legislativaHandler: function(){
			console.log('legislativa');
			if(!this.comisiones){
				setTimeout(this.legislativaHandler, 500);
				return;
			}
			var dataFiltered = _.groupBy(this.comisiones, function(comision){
				return (comision.legis)?'legis':'nolegis'
			});
			var template = "<table> <tr> <th>Comisiones legislativas ({{legis.length}})</th> </tr> {{#legis}} <tr><td><a href='organo/{{normalized.url}}'>{{nombre}}</a></td></tr> {{/legis}}<tr> <th>Comisiones no legislativas ({{nolegis.length}})</th> </tr> {{#nolegis}} <tr><td><a href='organo/{{normalized.url}}'>{{nombre}}</a></td></tr> {{/nolegis}} </table>";
			$('#tabsComisiones').html(tagsCom("legislativa"));
			$('.containerComisiones').html( Mustache.render(template, dataFiltered) );
		},

		mixtaHandler: function(){
			console.log('mixta');
			if(!this.comisiones){
				setTimeout(this.mixtaHandler, 500);
				return;
			}

			var dataFiltered = _.groupBy(this.comisiones, function(comision){
				return (comision.mixta)?'mixta':'nomixta'
			});
			var template = "<table> <tr> <th>Comisiones mixtas ({{mixta.length}})</th> </tr> {{#mixta}} <tr><td><a href='organo/{{normalized.url}}'>{{nombre}}</a></td></tr> {{/mixta}}<tr> <th>Comisiones no mixtas ({{nomixta.length}})</th> </tr> {{#nomixta}} <tr><td><a href='organo/{{normalized.url}}'>{{nombre}}</a></td></tr> {{/nomixta}} </table>";
			$('#tabsComisiones').html(tagsCom("mixta"));
			$('.containerComisiones').html( Mustache.render(template, dataFiltered) );
		},

		permanenteHandler: function(){
			console.log('permanente');
			if(!this.comisiones){
				setTimeout(this.permanenteHandler, 500);
				return;
			}

			var dataFiltered = _.groupBy(this.comisiones, function(comision){
				return (comision.perm)?'perm':'noperm'
			});
			var template = "<table> <tr> <th>Comisiones permanentes ({{perm.length}})</th> </tr> {{#perm}} <tr><td><a href='organo/{{normalized.url}}'>{{nombre}}</a></td></tr> {{/perm}}<tr> <th>Comisiones no permanentes ({{noperm.length}})</th> </tr> {{#noperm}} <tr><td><a href='organo/{{normalized.url}}'>{{nombre}}</a></td></tr> {{/noperm}} </table>";
			$('#tabsComisiones').html(tagsCom("permanente"));
			$('.containerComisiones').html( Mustache.render(template, dataFiltered) );
		},
		
		numDipusHandler: function(){
			//console.log('numdipus');
			/*this.apiDipusCall({q:'"cargos_congreso.tipoOrgano":"^C"',only:'["cargos_congreso"]'}, function(_data){
				this.cargos_congreso= _data;
				alert('we have data!');
			});*/	
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
		},
		apiCall: function(_data, callback){
			$.ajax({
				url:'http://api.quehacenlosdiputados.net/organos',
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
