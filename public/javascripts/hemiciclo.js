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
                    cursor: "pointer"
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
                    self.popUp.html('<span>' + this.diputado.nombre + ' ' + this.diputado.apellidos + '</span>');
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