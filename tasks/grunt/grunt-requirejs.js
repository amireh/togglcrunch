module.exports = {
  compile: {
    options: {
      baseUrl: 'src/js',
      out: 'www/dist/app.js',
      mainConfigFile: 'src/js/main.js',
      optimize: 'uglify2',

      paths: {
        requireLib: '../../vendor/js/require'
      },

      removeCombined:           false,
      inlineText:               true,
      preserveLicenseComments:  false,

      uglify: {
        toplevel:         true,
        ascii_only:       true,
        beautify:         false,
        max_line_length:  1000,
        no_mangle:        false
      },

      uglify2: {
        warnings: true,
        mangle:   true,

        output: {
          beautify: false
        },

        compress: {
          sequences:  true,
          dead_code:  true,
          loops:      true,
          unused:     true,
          if_return:  true,
          join_vars:  true
        }
      },

      pragmasOnSave: {
        excludeHbsParser:   true,
        excludeHbs:         true,
        excludeAfterBuild:  true
      },

      pragmas: {
        production: true
      },

      name: 'main',
      include: [ 'main', 'requireLib' ]
    }
  }
};