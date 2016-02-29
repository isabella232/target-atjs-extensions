/*!
 * adobe.target.ext.angular.ngroute.js v0.1.0
 *
 * Copyright 1996-2016. Adobe Systems Incorporated. All rights reserved.
 * 
 */

/*! 
 * Usage example
    adobe.target.ext.angular.initRoutes(app, // Angular module, object reference or string, required 
    {
        params:  targetPageParamsAll(),      // Target mbox parameters, optional
        //mbox: 'custom-mbox-name',          // Target mbox name, optional
        //selector: 'body',                  // CSS selector to inject Target content to, optional
        //timeout: 5000,                     // Target call timeout
        allowedRoutesFilter: [],             // Blank for all routes or restrict to specific routes: ['/','/about','/item/:id']
        disallowedRoutesFilter: [],          // Exclude specific routes: ['/login','/privacy']
        debug: true                          // Print console statements
    });
*/

!(function(A){
    "use strict";

    // Set up adobe.taregt.ext.initRoutes namespace
    A.target = A.target || {};
    A.target.ext = A.target.ext || {};
    A.target.ext.angular = A.target.ext.angular || {};

    A.target.ext.angular.initRoutes = function(app,opts){
        
        // Define Angular module from string or object
        var appModule = (typeof app==='string') ? angular.module(app) : app;       
        var lib =       A.target.ext.lib;
        var utils =     new lib.Util();
        var options =   lib.getOptions(opts||{});
        var log =       (options.debug && utils.log) ? utils.log : function(){};

        // Angular Run Block
        appModule.run(
            ['adobeTargetOfferService', '$route', '$rootScope', 
                function(adobeTargetOfferService, $route, $rootScope) {
                    
                    // Apply route resolve for Target calls
                    adobeTargetOfferService.applyTargetToRoutes($route.routes);

                    // When DOM is updated, apply Target offer. This event controls the flicker
                    $rootScope.$on("$viewContentLoaded", function(event, next, current) {
                        adobeTargetOfferService.applyOffer();
                    });

                }
            ]
        );

        // Angular Service for Adobe Target calls
        appModule.factory('adobeTargetOfferService', ['$q', function($q) {

            // Initialize shared Service object 
            var service =  new lib.Service(options, $q, log);
            
            // Add ngRoute-specific implementation by assigning resolve to all valid routes
            service.applyTargetToRoutes = function(locations) {
                Object.keys(locations).forEach(function(obj) {
                    if (typeof obj === 'string') {
                        log('location:' + obj);
                        if (utils.isRouteAllowed(obj, options.allowedRoutesFilter, options.disallowedRoutesFilter)) {// Allowed Targets
                            var route = locations[obj];
                            route.resolve = route.resolve || {};
                            route.resolve.offerData = function(adobeTargetOfferService) {
                                return adobeTargetOfferService.getOffer();
                            };
                        };

                    };
                });
            };

            return service;
        }])

    };

})(adobe);