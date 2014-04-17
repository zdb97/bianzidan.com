module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
	
	// CONFIG ===================================
	uglify: {
		options: {
			compress: true,
			beautify: false,	// true to unminified assets
			mangle: true		// false to prevent changes to your variable and function names.
		},
		custom: {
			files: {
				'js_min/custom/require-config.js': ['js/custom/require-config.js'],
				'js_min/custom/index.js': ['js/custom/index.js'],
				'js_min/custom/map.js': ['js/custom/map.js'],
				'js_min/custom/resume.js': ['js/custom/resume.js']
			}
		}
	},
	
	compass: {                  
		prod: {                   
		  	options: {              
		  		//config: 'compass_conf.rb',
				sassDir: 'scss',
				cssDir: 'css',
				javascriptsDir: 'js',
				require: [
				  'zurb-foundation'
				],
				environment: 'production',
				outputStyle: 'compressed',
				noLineComments: true,
				debugInfo: false
		  	}
		},
		dev: {                    
		  	options: {
		  		//config: 'compass_conf.rb',
				sassDir: 'scss',
				cssDir: 'css',
				javascriptsDir: 'js',
				require: [
				  'zurb-foundation'
				],
				environment: 'development',
				outputStyle: 'compact',
				noLineComments: false,
				debugInfo: true
		  	}
		}
  	}, 
	watch: {
		compassProd: {
			files: 'scss/*.scss',
			tasks: ['compass:prod']
		},	
		compassDev: {
			files: 'scss/*.scss',
			tasks: ['compass:dev']
		}
	}
  });

  // Load the plugins =====================================
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // TASKS =====================================
  //grunt.registerTask('default', ['uglify']);
  grunt.registerTask('default', ['jshint', 'compass']);

  };