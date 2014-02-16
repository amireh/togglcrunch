var srcRoot = 'src/';
var vndRoot = 'vendor/';

module.exports = {
  options: {
    nospawn: true
  },
  // scripts: {
  //   files: [ srcRoot + '/js/**/*.js' ],
  //   tasks: [ 'jshint' ]
  // },
  css: {
    files: '{src,vendor}/css/**/*.{less,css}',
    tasks: [ 'less', 'notify:less' ]
  },
  locales: {
    files: 'config/locales/*.yml',
    tasks: [ 'compile:locales', 'notify:locales' ]
  },
  docs: {
    files: [ '.jsduck', 'doc/guides/**/*.md', 'doc/*.*' ],
    tasks: [ 'docs', 'notify:docs' ]
  }
};