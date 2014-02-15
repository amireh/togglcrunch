module.exports = {
  main: {
    src: [ 'src/js' ],
    dest: 'doc/api',
    options: {
      'title': 'Hax.js Reference',
      'builtin-classes': false,
      'color': true,
      'no-source': true,
      'tests': false,
      'processes': 4,
      'guides': 'doc/guides.json',
      'images': 'doc/images',
      'eg-iframe': 'doc/app-iframe.html',
      'head-html': 'doc/head.html',
      'warnings': [],
      'external': [
        'XMLHttpRequest',
        'jQuery',
        'jQuery.Event',
        '$',
        '_',
        'lodash',
        'Handlebars',
        'Backbone',
        'Backbone.Router',
        'Backbone.View',
        'Backbone.Model',
        'Backbone.Collection',
        'Moment'
      ]
    }
  }
};