module.exports = function(grunt) {

	var license = 	"Copyright (c) 2014 by Marco Stagni < http://marcostagni.com mrc.stagni@gmail.com > and contributors.\n\nSome rights reserved. "+
					"Redistribution and use in source and binary forms, with or without\n"+
					"modification, are permitted provided that the following conditions are\n"+
					"met:\n\n"+
						"* Redistributions of source code must retain the above copyright\n"+
						"  notice, this list of conditions and the following disclaimer.\n\n"+
						"* Redistributions in binary form must reproduce the above\n"+
						"  copyright notice, this list of conditions and the following\n"+
						"  disclaimer in the documentation and/or other materials provided\n"+
						"  with the distribution.\n\n"+
						"* The names of the contributors may not be used to endorse or\n"+
						"  promote products derived from this software without specific\n"+
						"  prior written permission.\n\n"+
					"THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n"+
					"'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\n"+
					"LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\n"+
					"A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\n"+
					"OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\n"+
					"SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\n"+
					"LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\n"+
					"DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\n"+
					"THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n"+
					"(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\n"+
					"OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\n"+
					"Wage contains third party software in the 'app/vendor' directory: each\n"+
					"file/module in this directory is distributed under its original license.\n\n";


	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['src/**/*.js'],
				dest: 'build/app/lib/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> version: <%= pkg.version %>, <%= grunt.template.today("dd-mm-yyyy") %>\n' + license + '*/\n'
			},
			dist: {
				files: {
					'build/app/lib/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js'],
			options: {
				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true
				}
			}
		},
		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['concat', 'uglify']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};