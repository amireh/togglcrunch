module.exports = {
  src: [
    'src/js/main.js'
  ],
  options : {
    timeout: 10000,
    outfile: 'tests.html',

    host: 'http://127.0.0.1:<%= grunt.config.get("connect.tests.options.port") %>/',

    template: require('grunt-template-jasmine-requirejs'),
    templateOptions: {
      requireConfigFile: [ 'src/js/main.js', 'test/config.js' ],
      deferHelpers: true
    },

    keepRunner: true,

    version: '1.3.1',

    styles: [ 'www/dist/app.css', 'test/overrides.css' ],

    helpers: [
      'test/support/jasmine/*.js',
      'test/support/*.js',
      'test/helpers/*.js'
    ],

    specs: [
      'test/integration/**/*.js',
      'test/unit/**/*.js'
    ]
  }
};