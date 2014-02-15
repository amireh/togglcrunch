require([ 'text!/www/index.html' ], function(markup) {
  markup = markup.substr(markup.search(/<body/));
  markup = markup.substr(0, markup.search('</body>')+7);

  document.body.outerHTML = markup;

  require([ 'config/initializer' ], function(initialize) {
    $.CORS({ host: '' });

    initialize().then(launchTests);
  });
});