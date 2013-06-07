// Teetimes module
define([
  // Application.
  "app",

  "text!templates/teetimes.html",
  "text!templates/player.html",
  "text!templates/tee.html"
],

// Map dependencies from above array.
function(app, teetimesTemplate, playerTemplate, teeTemplate) {

  // Create a new module.
  var Teetimes = app.module();

  // Default Model.
  Teetimes.Model = Backbone.Model.extend({
    initialize: function() {
      this.set("assigned", false);
    }
  });

  // Default Collection.
  Teetimes.Players = Backbone.Collection.extend({
    model: Teetimes.Model,

    getRandomPlayer: function() {
      var unassigned = this.where({assigned: false});

      if(unassigned.length == 0){
        return false;
      }

      var randomPlayerID = Math.floor(Math.random()*unassigned.length);
      unassigned[randomPlayerID].set("assigned", true);

      return unassigned[randomPlayerID];
    },

    alpha_comparator: function(player) {
        return player.get("name");
    },

    handicap_comparator: function(player) {
        return player.get("handicap");
    }

  });

  Teetimes.Views.Player = Backbone.View.extend({
    tagName: "li",
    template: _.template(playerTemplate),

    initialize: function(opts) {
      this.model = opts.model;
      this.listenTo(this.model, "change:assigned", this.assignedChange);

      this.render();
    },

    render: function() {
      this.$el.append(this.template(this.model.toJSON()));
      $(".players ul").append(this.$el);

      this.assignedChange();
    },

    assignedChange: function() {
      if(this.model.get("assigned")){
        this.$el.addClass("assigned");
      } else {
        this.$el.removeClass("assigned");
      }
    }
  });

  Teetimes.Views.TeeTime = Backbone.View.extend({
    tagName: "div",
    className: "tee",
    template: _.template(teeTemplate),

    initialize: function(opts) {
      this.limit = opts.limit;
      this.assignedPlayers = 0;
      this.$teetimes = opts.$teetimes;
      this.render();
    },

    render: function() {
      this.$el.append(this.template);
      this.$teetimes.append(this.$el);
    },

    isFull: function() {
      return this.assignedPlayers == this.limit;
    },

    reset: function() {
      this.assignedPlayers = 0;
      this.$el.find("ul").empty();
    },

    assignPlayer: function(player) {
      if(this.assignedPlayers < this.limit){
        this.assignedPlayers++;
        var $player = $("<li>"+player.get('name')+"</li>")
        this.$el.find("ul").append($player);
        return true;
      }

      return false;
    }

  });

  // Default View.
  Teetimes.Views.Names = Backbone.View.extend({
    el: "#main",

    template: _.template(teetimesTemplate),

    events: {
      "click .randomise": "pickPlayers",
      "click .reset": "resetPicks",
      "click .sort a": "sortPlayers"
    },

    initialize: function() {
      this.teetimes = [];
      this.render();

      this.players = new Teetimes.Players();
      this.listenTo(this.players, "sort", this.addPlayers);

      var players = [ 
        {
          name: "Mike Rockall",
          handicap: 18
        }, {
          name: "Ryan Kelly",
          handicap: 28
        }, {
          name: "Rob Kennedy",
          handicap: 24
        }, {
          name: "Brendan Considine",
          handicap: 18
        }, {
          name: "Liam Rockall",
          handicap: 18
        }, {
          name: "Con Crowley",
          handicap: 24
        }, {
          name: "Stephen Trainor",
          handicap: 28
        }, {
          name: "Kevin Coen",
          handicap: 28
        }, {
          name: "Conor O'Hagan",
          handicap: 0
        }, {
          name: "Ciaran Considine",
          handicap: 18
        }, {
          name: "Phil Staunton",
          handicap: 18
        }, {
          name: "David Flanagan",
          handicap: 12
        }
      ];

      this.players.comparator = this.players.alpha_comparator;

      this.players.reset(players);
      this.players.sort();
      this.randomise();
    },

    render: function() {
      this.$el.append(this.template);
    },

    sortPlayers: function(ev){
      this.$el.find(".sort a").removeClass("active");
      var sort_type = $(ev.currentTarget).addClass("active").data("sort");
      this.players.comparator = this.players[sort_type+"_comparator"];
      this.players.sort();
    },

    resetPicks: function() {
      this.players.each(function(model, index){
        model.set("assigned", false);
      });

      _.each(this.teetimes, function(tee, index){
        tee.reset();
      });
    },

    addPlayers: function(collection) {
      this.$el.find(".players ul").empty();
      collection.each(_.bind(function(model, index){
        var player_view = new Teetimes.Views.Player({
          model: model
        })
      }, this));
      this.$el.find(".stats").html(collection.length + " players");
    },

    randomise: function() {
      // Determine how many groups there should be.
      var no_tee_times = Math.floor(this.players.length/3),
          extras = this.players.length%3,
          limit = 3,
          $teetimes = $(".teetimes");

      for (var i = 0; i < no_tee_times; i++) {

        limit = 3;

        if(extras > 0){
          limit++;
          extras--;
        }

        this.teetimes.push(new Teetimes.Views.TeeTime({limit: limit, $teetimes: $teetimes}));

        if((i+1)%2 == 0){
          $teetimes.append("<div class='clear'></div>");
        }
      };
    },

    pickPlayers: function() {
      if(this.assignRandomPlayer()){
        setTimeout(_.bind(this.pickPlayers, this), 2000);
      }
    },

    assignRandomPlayer: function() {
      var player = this.players.getRandomPlayer();

      if(!player){
        return false;
      }

      var tee = this.getRandomGroup();

      if(!tee.isFull()){
        tee.assignPlayer(player)
      }

      return true;
    },

    getRandomGroup: function() {
      var rand_index = Math.floor(Math.random()*this.teetimes.length);
      var tee = this.teetimes[rand_index];

      if(tee.isFull()){
        return this.getRandomGroup();
      } else {
        return tee;
      }
    }

  });

  // Return the module for AMD compliance.
  return Teetimes;

});
