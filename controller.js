var fs = require('fs');

module.exports = {
  getGMapsKey: function(req, res) {
    fs.readFile('./config.txt', function(err, file) {
      if (err) {

      } else {
        var appKeys = JSON.parse(file);
        var gMapsKey = appKeys.gMaps_key;
        res.send(gMapsKey);
      }
    });
  }
}