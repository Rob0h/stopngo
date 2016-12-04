var controller = require('./controller.js');
var path = require('path');

module.exports = function(app, express) {
  // Routing for static components
  console.log(__dirname);
  app.use('/compiled', express.static(path.join(__dirname, '..','/compiled')));
  app.use('/node_modules', express.static(path.join(__dirname, '..','/node_modules')));
  app.use('/app', express.static(path.join(__dirname, '..', '/app')));
  app.use('/', express.static(path.join(__dirname, '..')));

  // Routing for index
  app.get('/', function(req, res) {
    res.sendFile('index.html', { root: __dirname + '/../app' });
  });

  // Routing for yelp searching and google maps
  app.get('/search', function(req, res) {
    controller.searchYelp(req, res);
  })
  app.get('/gMapsKey', function(req, res) {
    controller.getGMapsKey(req, res);
  });
}