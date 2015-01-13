require.config({
	baseUrl: "./js/",
	//baseUrl: "./js_min/",
	paths: {
		custom: "custom/",
		lib: "lib/",
		 
		jquery: "//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min",
		underscore: "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min",
		backbone: "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min",
		masonry: "//cdnjs.cloudflare.com/ajax/libs/masonry/3.1.1/masonry.pkgd", 
		modernizr: "//cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min",
		async: "lib/async",
		responsivenav: "lib/responsive-nav.min",
		scrollto: "lib/jquery-scrollto",
		foundation: "lib/foundation/foundation",
		accordion: "lib/foundation/foundation.accordion",
		/*
		jquery: "lib/jquery-1.10.2.min",
		underscore: "lib/underscore-min",
		backbone: "lib/backbone-min",
		masonry: "lib/masonry.pkgd.min",
		async: "lib/async",
		responsivenav: "lib/responsive-nav.min",
		*/
		
		// internal js
		index: "custom/index",
		map: "custom/map",
		resume: "custom/resume"
		
	},
	/* 
	 * shim: http://requirejs.org/docs/api.html#config-shim
	 * only use shim config for non-AMD scripts, scripts that do not already call define(). The shim config will not work correctly if used on AMD scripts,
	 */
	shim: {
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		},
		'masonry': {
			deps: ['jquery'],
			exports: 'masonry'
		},
		'responsivenav': {
			exports: 'responsiveNav'
		}, 
		'accordion': {
			deps: ['foundation', 'jquery']
		},
		'foundation': {
			deps: ['jquery', 'modernizr'],
			exports: 'foundation'	
		},
		'modernizr': {
            exports: 'modernizr'
        },
        'scrollto': {
        	deps: ['jquery'],
        	exports: 'scrollTo'
        }
	}
});



