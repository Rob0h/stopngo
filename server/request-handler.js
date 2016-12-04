var controller = require('./controller.js');

module.exports = function(app, express) {
  app.get('/', function(req, res) {
    res.sendFile('index.html', { root: __dirname + '/../app' });
  });
  app.get('/app/style.css', function(req, res) {
    res.sendFile('style.css', { root: __dirname + '/../app' });
  });
  app.get('/compiled/app/index.js', function(req, res) {
    res.sendFile('index.js', { root: __dirname + '/../app/compiled/app' });
  });

  app.get('/node_modules/react/dist/react.js', function(req, res) {
    res.sendFile('react.js', { root: __dirname + '/../node_modules/react/dist/' });
  });
  app.get('/node_modules/react-dom/dist/react-dom.js', function(req, res) {
    res.sendFile('react-dom.js', { root: __dirname + '/../node_modules/react-dom/dist/' });
  });

  app.get('/compiled/components/SearchResultEntry.jsx', function(req, res) {
    res.sendFile('SearchResultEntry.js', { root: __dirname + '/../app/compiled/components' });
  });
  app.get('/compiled/components/YelpSearch.jsx', function(req, res) {
    res.sendFile('YelpSearch.js', { root: __dirname + '/../app/compiled/components' });
  });
  app.get('/compiled/components/StopPoints.jsx', function(req, res) {
    res.sendFile('StopPoints.js', { root: __dirname + '/../app/compiled/components' });
  });
  app.get('/compiled/components/SearchSort.jsx', function(req, res) {
    res.sendFile('SearchSort.js', { root: __dirname + '/../app/compiled/components' });
  });
  app.get('/compiled/components/Results.jsx', function(req, res) {
    res.sendFile('Results.js', { root: __dirname + '/../app/compiled/components' });
  });
  app.get('/compiled/components/Input.jsx', function(req, res) {
    res.sendFile('Input.js', { root: __dirname + '/../app/compiled/components' });
  });
  app.get('/compiled/components/App.jsx', function(req, res) {
    res.sendFile('App.js', { root: __dirname + '/../app/compiled/components' });
  });

  app.get('/search', function(req, res) {
    controller.searchYelp(req, res);
  })
  app.get('/gMapsKey', function(req, res) {
    controller.getGMapsKey(req, res);
  });
}