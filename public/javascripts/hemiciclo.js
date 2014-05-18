var HemicicloViewBase = Backbone.View.extend({
    el: '#hemiciclo',
    hemiciclo_paper: null,
    WIDTH: 540,
    HEIGHT: 400,
    escanos: {},
    dataUrl: "/javascripts/hemiciclo_map.json",
    diputadosUrl: "",
    colors: {
        "popular": {
            "normal": "#1380B3",
            "hover": "#015881",
            "out": "#1380B3"
        },
        "socialista": {
            "normal": "#CC0000",
            "hover": "#970000",
            "out": "#CC0000"
        },
        "catalan": {
            "normal": "#C46600",
            "hover": "#8D4B04",
            "out": "#C46600"
        },
        "la-izquierda-plural": {
            "normal": "#33A815",
            "hover": "#22770D",
            "out": "#33A815"
        },
        "union-progreso-y-democracia": {
            "normal": "#B91A93",
            "hover": "#791561",
            "out": "#B91A93"
        },
        "vasco": {
            "normal": "#008129",
            "hover": "#0A471E",
            "out": "#008129"
        },
        "mixto": {
            "normal": "#707070",
            "hover": "#3C3C3C",
            "out": "#707070"
        }
    },
    initialize: function(options) {
        this.hemiciclo_paper = Raphael(this.$el[0], 540, 400);
        this.hemiciclo_paper.setViewBox(0, 0, 540, 400);
        $(window).on('resize', _.bind(this.onResizeView, this));
    },
    render: function() {
        var defer = $.Deferred();
        var self = this;
        $.getJSON(this.dataUrl, function(data) {
            //console.log('fetchData', data);
            _.each(data, function(escano) {
                var _esc_pos = escano.coords.split(',');
                var _esc = self.hemiciclo_paper
                    .circle(_esc_pos[0], _esc_pos[1], _esc_pos[2])
                    .attr({
                        stroke: "none",
                        fill: "#c3c3c3",
                        //cursor: "pointer"
                    });
                _esc.id = escano.escano;
                /*_esc.hover(function() {
                    self.trigger('escano:hover', this);
                    this.attr({
                        fill: "#666666"
                    });
                }, function() {
                    self.trigger('escano:out', this);
                    this.attr({
                        fill: "#c3c3c3"
                    });
                });*/
                self.escanos[_esc.id] = _esc;
            });
            self.onResizeView();
            defer.resolve(self);
        });
        return defer.promise();
    },
    onResizeView: function() {
        // TODO: hacer que la vista se adapte al tamaño del contenedor
        //console.log("onResizeView");
        //console.log(this.$el.innerWidth(), this.$el.innerHeight());
        var ratio = this.$el.innerWidth() / this.WIDTH;
        this.hemiciclo_paper.setSize(this.WIDTH * ratio, this.HEIGHT * ratio);
    },
    string_to_slug: function(str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();

        // remove accents, swap ñ for n, etc
        var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to = "aaaaeeeeiiiioooouuuunc------";
        for (var i = 0, l = from.length; i < l; i++) {

            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

        return str;
    }
});

var HemicicloGrupoView = HemicicloViewBase.extend({
    grupoID: null,
    popUpTemplate: '<div class="popUpDip"><span class="fotoimg"> <img src="/img/imagenesDipus/<%= diputado.id %>.jpg" alt="Fotografía de <%=diputado.nombre%> <%=diputado.apellidos%>"></span><div class="name"><%=diputado.nombre%> <%=diputado.apellidos%></div></div>',
    initialize: function(opts) {
        HemicicloGrupoView.__super__.initialize.apply(this, arguments);
        this.grupoID = (opts && opts.grupo) ? opts.grupo : this.$el.attr('data-grupo-parlamentario');
        this.diputadosUrl = 'http://api.quehacenlosdiputados.net/grupo/' + this.grupoID + '/diputados?only=["escano_actual","id","apellidos","nombre","normalized","grupo"]';
        //this.diputadosUrl = 'http://api.quehacenlosdiputados.net/diputados?only=["escano_actual","id","apellidos","nombre","normalized","grupo"]';
        this.render();
    },
    render: function() {
        var self = this;
        var defer = $.Deferred();
        //HemicicloViewBase.__super__.render.call();
        HemicicloGrupoView.__super__.render.apply(this, arguments)
            .then(function() {
                return self.cargaDiputados();
            })
            .done(function() {
                defer.resolve();
            });
        return defer.promise();
    },
    cargaDiputados: function() {
        var defer = $.Deferred();
        var self = this;
        $.get(this.diputadosUrl, function(diputados) {
            _.each(diputados, function(diputado) {
                var escano = self.escanos[diputado.escano_actual];
                var grupo = self.string_to_slug(diputado.grupo);
                //console.log(diputado.grupo, grupo);
                escano.diputado = diputado;
                escano.attr({
                    fill: self.colors[grupo].normal,
                    cursor: "pointer",
                    href: "/diputado/" + diputado.normalized.url
                }).hover(function() {
                    //console.log(this.diputado.nombre, this.diputado.apellidos);
                    console.log($(this.node).offset(), this.getBBox().width);
                    self.popUp = $('<div>', {
                        id: "hemi_popup",
                        class: 'popUp'
                    });
                    self.popUp.css({
                        "position": "absolute",
                        "top": $(this.node).offset().top + 'px',
                        "left": $(this.node).offset().left + (this.getBBox().width * 0.5) + 'px',
                    });
                    var template = _.template(self.popUpTemplate)
                    self.popUp.html(template({
                        "diputado": this.diputado
                    }));
                    $("body").append(self.popUp);

                    this.attr({
                        fill: self.colors[grupo].hover
                    });
                }, function() {
                    self.popUp.remove();
                    this.attr({
                        fill: self.colors[grupo].out
                    });
                });
            });
            defer.resolve();
        });
        return defer.promise();
    }
});
var HemicicloVotacionView = HemicicloViewBase.extend({
    votaciones: null,
    colors: {
        "no": {
            "normal": "#f70504",
            "hover": "#f70504",
            "out": "#f70504"
        },
        "si": {
            "normal": "#6fc354",
            "hover": "#6fc354",
            "out": "#6fc354"
        },
        "no-vota": {
            "normal": "#333333",
            "hover": "#333333",
            "out": "#333333"
        },
        "abstencion": {
            "normal": "#ecbc02",
            "hover": "#ecbc02",
            "out": "#ecbc02"
        }
    },
    popUpTemplate: '<div class="popUpDip"><span class="fotoimg"> <img src="/img/imagenesDipus/<%= diputado.id %>.jpg" alt="Fotografía de <%=diputado.nombre%> <%=diputado.apellidos%>"></span><div class="name"><%=diputado.nombre%> <%=diputado.apellidos%></div></div>',
    initialize: function(opts) {
        HemicicloGrupoView.__super__.initialize.apply(this, arguments);
        this.grupoID = (opts && opts.grupo) ? opts.grupo : this.$el.attr('data-grupo-parlamentario');
        this.diputadosUrl = 'http://api.quehacenlosdiputados.net/diputados?q={"nombre":{"$exists":true}}&only=["escano_actual","id","apellidos","nombre","normalized","grupo"]';
        this.votaciones = opts.votaciones;
        this.render();
    },
    render: function() {
        var self = this;
        var defer = $.Deferred();
        //HemicicloViewBase.__super__.render.call();
        HemicicloGrupoView.__super__.render.apply(this, arguments)
            .then(function() {
                return self.cargaDiputados();
            })
            .done(function() {
                defer.resolve();
            });
        return defer.promise();
    },
    cargaDiputados: function() {
        var defer = $.Deferred();
        var self = this;
        var votos_telematicos = 0;
        $.get(this.diputadosUrl, function(diputados) {
            _.each(self.votaciones, function(voto) {
                var escano = self.escanos[voto.asiento] || {};
                var sentido_voto = self.string_to_slug(voto.voto);
                //console.log(diputado.grupo, grupo);
                escano.diputado = _.findWhere(diputados, {
                    "apellidos": voto.diputado.split(',')[0],
                    "nombre": voto.diputado.split(',')[1].substr(1)
                });
                //console.log(voto.diputado, escano.diputado, sentido_voto);
                if (voto.asiento == -1) {
                    console.log("asiento -1 del diputado " + voto.diputado, voto);
                    return;
                }
                if (!escano.diputado) {
                    escano.diputado = {
                        "apellidos": voto.diputado.split(',')[0],
                        "nombre": voto.diputado.split(',')[1].substr(1),
                        "normalized": {
                            "url": '#'
                        }

                    }
                    console.log("no se ha encontrado al diputado " + voto.diputado, voto);
                    //return;
                }
                escano.attr({
                    fill: self.colors[sentido_voto].normal,
                    cursor: "pointer",
                    href: "/diputado/" + escano.diputado.normalized.url
                }).hover(function() {
                    //console.log(this.diputado.nombre, this.diputado.apellidos);
                    //console.log($(this.node).offset(), this.getBBox().width);
                    self.popUp = $('<div>', {
                        id: "hemi_popup",
                        class: 'popUp'
                    });
                    self.popUp.css({
                        "position": "absolute",
                        "top": $(this.node).offset().top + 'px',
                        "left": $(this.node).offset().left + (this.getBBox().width * 0.5) + 'px',
                    });
                    var template = _.template(self.popUpTemplate)
                    self.popUp.html(template({
                        "diputado": this.diputado
                    }));
                    $("body").append(self.popUp);
                    this.attr({
                        fill: self.colors[sentido_voto].hover
                    });
                }, function() {
                    self.popUp.remove();
                    this.attr({
                        fill: self.colors[sentido_voto].out
                    });
                });
            });
            defer.resolve();
        });
        return defer.promise();
    }
});