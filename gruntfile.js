module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
	
	// CONFIG ===================================
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
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // TASKS =====================================
  //grunt.registerTask('default', ['uglify']);
  grunt.registerTask('default', ['jshint', 'compass']);

  };