/*
(function(_){
	_.miFiltro = function(){
		console.log('filtro');
		return 'filtro';
	}
})(_);
*/

$(function(){
	var Router = Backbone.Router.extend({
		comisiones: null,
		initialize: function(){
			this.apiCall({q:'{"tipo":"^C"}'}, function(_data){
				this.comisiones = _data;
			});
		},
		routes:{
			'' : 'home',
			'legislativa': 'legislativaHandler',
			'mixta': 'mixtaHandler',
			'permanente': 'permanenteHandler'
		},
		home: function(){
			alert('HOME');
		},
		legislativaHandler: function(){
			console.log('legislativa')
			if(!this.comisiones){
				setTimeout(this.legislativaHandler, 500);
				return;
			}

			var dataFiltered = _.groupBy(this.comisiones, function(comision){
				return (comision.legis)?'legis':'nolegis'
			});
			var template = "<table> <tr> <th>Legislativas</th> </tr> {{#legis}} <tr><td>{{nombre}}</td></tr> {{/legis}}<tr> <th>No Legislativas</th> </tr> {{#nolegis}} <tr><td>{{nombre}}</td></tr> {{/nolegis}} </table>";
			$('.containerComisiones').html( Mustache.render(template, dataFiltered) );
		},
		mixtaHandler: function(){
			console.log('mixta')
			if(!this.comisiones){
				setTimeout(this.mixtaHandler, 500);
				return;
			}

			var dataFiltered = _.groupBy(this.comisiones, function(comision){
				return (comision.mixta)?'mixta':'nomixta'
			});
			var template = "<table> <tr> <th>Mixta</th> </tr> {{#mixta}} <tr><td>{{nombre}}</td></tr> {{/mixta}}<tr> <th>No Mixta</th> </tr> {{#nomixta}} <tr><td>{{nombre}}</td></tr> {{/nomixta}} </table>";
			$('.containerComisiones').html( Mustache.render(template, dataFiltered) );
		},
		permanenteHandler: function(){
			console.log('permanente')
			if(!this.comisiones){
				setTimeout(this.permanenteHandler, 500);
				return;
			}

			var dataFiltered = _.groupBy(this.comisiones, function(comision){
				return (comision.perm)?'perm':'noperm'
			});
			var template = "<table> <tr> <th>Permanente</th> </tr> {{#perm}} <tr><td>{{nombre}}</td></tr> {{/perm}}<tr> <th>No Permanente</th> </tr> {{#noperm}} <tr><td>{{nombre}}</td></tr> {{/noperm}} </table>";
			$('.containerComisiones').html( Mustache.render(template, dataFiltered) );
		},
		apiCall: function(_data, callback){
			$.ajax({
				url:'http://localhost:3002/organos',
				data : _data
			}).done(function(result){
				//console.log(result);
				callback(result);
			});
		}
	});

	var router = new Router();
	Backbone.history.start();
});