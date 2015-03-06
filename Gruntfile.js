module.exports = function(grunt){
  var files = [];

  // Load plugins
  grunt.loadNpmTasks("grunt-contrib-jshint");

  // Watch Files
  files.push('app.js');
  files.push('config.js');

  grunt.initConfig({
    options: {
      livereload: true,
    },
    jshint: {
      all: files,
      options: {
        unused: true,
        node: true,
        newcap: false,
        validthis: true
      }
    }
  });
};
