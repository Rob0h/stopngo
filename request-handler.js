var controller = require('./controller.js');

module.exports = function(app, express) {
  app.get('/', function(req, res) {
    res.sendFile('index.html');
  });
  app.get('/app/style.css', function(req, res) {
    res.sendFile('style.css', { root: __dirname + '/app' });
  });
  app.get('/app/app.js', function(req, res) {
    res.sendFile('app.js', { root: __dirname + '/app' });
  });
  app.get('/gMapsKey', function(req, res) {
    controller.getGMapsKey(req, res);
  });
}