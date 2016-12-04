var fs = require('fs');
var Yelp = require('yelp');

module.exports = {
  getGMapsKey: function(req, res) {
    fs.readFile('../config.txt', function(err, file) {
      if (err) {
        console.log(err);
      } else {
        var appKeys = JSON.parse(file);
        var gMapsKey = appKeys.gMaps_key;
        res.send(gMapsKey);
      }
    });
  }, 
  searchYelp: function(req, res) {
    var queryTerms = req.query.query.split(' ');
    var searchTerms = {term: queryTerms[0], ll: queryTerms[1], sort: queryTerms[2]};
    this.searchYelpFor(searchTerms, function(searchResults) {
      res.send(searchResults);
    });
  },
  searchYelpFor: function(searchTerms, callback) {
      fs.readFile("../config.txt", "utf-8", function(err, file) {
    if (err) {
      //console.log("Yelp API keys were unable to be read due to:" + err);
      var yelp = new Yelp({
        consumer_key: process.env.consumer_key,
        consumer_secret: process.env.consumer_secret,
        token: process.env.token,
        token_secret: process.env.token_secret
      });
      yelp.search(searchTerms)
        .then(function(data) {
        console.log("Yelp results returned.")
        callback(data);
      }).catch(function(err) {
        console.error(err); 
      });
    }
    else {
      var appKeys = JSON.parse(file);
      var yelp = new Yelp({
        consumer_key: appKeys.consumer_key,
        consumer_secret: appKeys.consumer_secret,
        token: appKeys.token,
        token_secret: appKeys.token_secret
      });
      yelp.search(searchTerms)
        .then(function(data) {
        console.log("Yelp results returned.")
        callback(data);
      }).catch(function(err) {
        console.error(err); 
      });
    }
  });
  }
}