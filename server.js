var http = require('http');
    Yelp = require('yelp');
      fs = require('fs');
     url = require('url');
 express = require('express');

var results;

var yelp = new Yelp({
  consumer_key: "6Tl7j5uOlP81bed9buksBQ",
  consumer_secret: "kv4EGn8hvaahmd7h1-2wayzIgBE",
  token: "Gkvn649GmQldaXqQ5QNdyn6bnbjiPJ-Q",
  token_secret: "6Szc-bPewHz5bbuHScWIF1mt-b0"
})

function searchYelpFor(searchTerms, callback) {
  yelp.search(searchTerms)
  .then(function(data) {
    console.log("Yelp results returned.")
    callback(data);
  })
  .catch(function(err) {
    console.error(err); 
  })
}

/** Creates server to route to the client side js, css, 
  * and index files at localhost:8000.
  */
var server = http.createServer(function(request, response) {
    var path = url.parse(request.url).pathname;
    if (path == "/search") {
      response.writeHead(200, {"Content-Type": "json"});
      var query = url.parse(request.url,true).query;
      var queryTerms = query.query.split(" ");
      var searchTerms = {term: queryTerms[0], ll: queryTerms[1]};
      searchYelpFor(searchTerms, function(results) {
        response.write(JSON.stringify(results));
        response.end();
      });
    }
    else if (path == "/app/app.js") {
      fs.readFile("./app/app.js", function(err, file){
        if (err) {
          console.log("Client side JS could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": "json"});
          response.end(file, "utf-8");
        }
      });
    }
    else if (path == "/app/style.css") {
      fs.readFile("./app/style.css", function(err, file){
        if (err) {
          console.log("Client side CSS could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": "text/css"});
          response.end(file, "utf-8");
        }
      });
    }
    else {
      fs.readFile("./app/index.html", function(err, file){
        if (err) {
          console.log("Client index could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": "html"});
          response.end(file, "utf-8");
        }
      });
    }
});
server.listen(process.env.port || 8000);
console.log('Server is listening...')