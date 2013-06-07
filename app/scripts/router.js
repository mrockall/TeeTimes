/* global define */

define([
    // Application.
    'backbone',

    'app',

    '../modules/teetimes'
],

function(Backbone, app, TeeTimes) {
    'use strict';
    // Defining the application router, you can attach sub routers here.
    var Router = Backbone.Router.extend({
        routes: {
            '': 'index'
        },

        index: function() {
            var names = new TeeTimes.Views.Names();
        }
    });

    return Router;

});

