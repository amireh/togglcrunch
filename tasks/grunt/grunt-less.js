module.exports = {
  options: {
    strictImports: true
  },
  production: {
    options: {
      paths: [ 'src/css' ],
      compress: false
    },
    files: {
      'www/dist/app.css': 'src/css/app.less',
      'www/dist/app-rtl.css': 'src/css/app-rtl.less'
    }
  }
};