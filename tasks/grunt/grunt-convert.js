module.exports = {
  locales: {
    files: [{
      expand: true,
      cwd: 'config/locales',
      src: [ '*.yml' ],
      dest: 'www/assets/locales',
      ext: '.json'
    }]
  }
};
