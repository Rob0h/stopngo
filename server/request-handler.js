var controller = require('./controller.js');

module.exports = function(app, express) {
  app.get('/', function(req, res) {
    res.sendFile('index.html');
  });
  app.get('/app/style.css', function(req, res) {
    res.sendFile('style.css', { root: __dirname + '/../app' });
  });
  app.get('/app/app.js', function(req, res) {
    res.sendFile('app.js', { root: __dirname + '/../app' });
  });
  app.get('/search', function(req, res) {
    controller.searchYelp(req, res);
  })
  app.get('/gMapsKey', function(req, res) {
    controller.getGMapsKey(req, res);
  });
  app.get('/compiled/components/SearchResultEntry.jsx', function(req, res) {
    res.sendFile('SearchResultEntry.js', { root: __dirname + '/../app/compiled/components' });
  });
}