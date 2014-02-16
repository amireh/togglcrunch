module.exports = function(grunt) {
  'use strict';

  var shell = require('shelljs');
  var config;

  function readPackage() {
    return grunt.file.readJSON('package.json');
  };

  function loadFrom(path, config) {
    var glob = require('glob'),
    object = {};

    glob.sync('*', {cwd: path}).forEach(function(option) {
      var key = option.replace(/\.js$/,'').replace(/^grunt\-/, '');
      config[key] = require(path + option);
    });
  };

  config = {
    pkg: readPackage(),
    env: process.env
  };

  loadFrom('./tasks/grunt/', config);

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bumpup');
  grunt.loadNpmTasks('grunt-tagrelease');
  grunt.loadNpmTasks('grunt-jsvalidate');
  grunt.loadNpmTasks('grunt-jsduck');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-convert');

  // Please don't rename these, they're used by `bin/build`:
  // ---
  grunt.registerTask('compile:js', [ 'requirejs:compile' ]);
  grunt.registerTask('compile:css', [ 'less' ]);
  grunt.registerTask('compile:locales', [ 'convert:locales' ]);
  // ---

  grunt.registerTask('updatePkg', function () {
    grunt.config.set('pkg', readPackage());
  });

  grunt.registerTask('link_assets', function() {
    shell.exec('[ ! -s ./assets ] && ln -s ./www/assets ./;');
    return true;
  });

  grunt.registerTask('unlink_assets', function() {
    shell.exec('[ -s ./assets ] && rm ./assets;');
    return true;
  });

  // grunt.registerTask('test', [ 'jsvalidate', /* 'jshint', */ ]);
  grunt.registerTask('test', [
    'link_assets', 'connect:tests', 'jasmine', 'unlink_assets'
  ]);

  grunt.registerTask('build', [
    'compile:locales',
    'compile:js',
    'compile:css'
  ]);

  grunt.registerTask('docs',  [ 'jsduck' ]);
  grunt.registerTask('default', [ 'test' ]);
  grunt.registerTask('version', [ 'string-replace:version' ]);

  // Release alias task
  grunt.registerTask('release', function (type) {
    grunt.task.run('test');
    grunt.task.run('bumpup:' + ( type || 'patch' ));
    grunt.task.run('updatePkg');
    grunt.task.run('version');
    grunt.task.run('build');
    grunt.task.run('tagrelease');
    grunt.task.run('development');
  });

  grunt.registerTask('development',
  'Prepares a live reload development environment.',
  function() {
    shell.exec('rm www/dist/app.js &> /dev/null');
    shell.exec('cd www/dist; ln -s ../../src/js/main.js ./app.js');
    shell.exec('cd www/; ln -s ../src ./');
    shell.exec('cd www/; ln -s ../vendor ./');
    shell.exec('cp config/development/index.html.in www/index.html');

    grunt.task.run('compile:css');
  });

  grunt.registerTask('production',
  'Cleans up after the development environment.',
  function() {
    shell.exec('cp config/production/index.html.in www/index.html');
    shell.exec('if [ -s www/src ]; then rm www/src; fi');
    shell.exec('if [ -s www/vendor ]; then rm www/vendor; fi');
  });
};
