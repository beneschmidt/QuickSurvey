module.exports = function(grunt) {

  grunt.initConfig({
    wiredep: {
      task: {
        src: [
          'index.html'
        ]
      }
    },
    watch: {
      files: ['**/*.html','**/*.js','**/*.css']
    },
    connect: {
      server: {
        options: {
          port: 9001,
          hostname: 'localhost',
          base: '.',
          open: true
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('serve', [
    'wiredep',
    'connect',
    'watch'
  ]);

};