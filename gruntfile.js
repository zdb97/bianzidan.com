module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

	compass: {                  // Task
		prod: {                   // Target
		  	options: {              // Target options
		  		config: 'compass_conf.rb',
				sassDir: 'scss',
				cssDir: 'css',
				environment: 'production',
				outputStyle: 'compressed',
				noLineComments: true
		  	}
		},
		dev: {                    // Another target
		  	options: {
		  		config: 'compass_conf.rb',
				sassDir: 'scss',
				cssDir: 'css',
				environment: 'development',
				outputStyle: 'compact',
				noLineComments: false
		  	}
		}
  	}

  });

  // Load the plugin that provides the "uglify" task.
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compass');

  // Default task(s).
  //grunt.registerTask('default', ['uglify']);
  //grunt.registerTask('default', ['jshint', 'compass']);
	grunt.registerTask('default', ['compass:prod']);

  };