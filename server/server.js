var http = require('http');
    Yelp = require('yelp');
      fs = require('fs');
     url = require('url');
 express = require('express');

/** searchYelpFor(searchTerms, callback) parses through config.txt for user inputted
  * yelp API keys and creates a yelp query object with the inputted searchTerms
  * and runs the callback function the results are returned.
  */
function searchYelpFor(searchTerms, callback) {
  fs.readFile("../config.txt", "utf-8", function(err, file) {
    if (err) {
      console.log("Yelp API keys were unable to be read due to:" + err);
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

/** Creates server to route to the client side js, css, 
  * and index files at localhost:8000.
  */
var server = http.createServer(function(request, response) {
    var path = url.parse(request.url).pathname;
    console.log('Serving request type ' + request.method + ' for url ' + path);
    if (path == "/search") {
      response.writeHead(200, {"Content-Type": "json"});
      var query = url.parse(request.url,true).query;
      var queryTerms = query.query.split(" ");
      var searchTerms = {term: queryTerms[0], ll: queryTerms[1], sort: queryTerms[2]};
      searchYelpFor(searchTerms, function(results) {
        response.write(JSON.stringify(results));
        response.end();
      });
    }
    else if (path == "/gMapsKey") {
      fs.readFile("../config.txt", function(err,file) {
        if(err) {
          console.log("Google Maps API key was unable to be read due to: " + err);
        }
        else {
          var appKeys = JSON.parse(file);
          var gMapsKey = appKeys.gMaps_key;
          response.writeHead(200, {"Content-Type": "json"});
          response.end(gMapsKey, "utf-8");
        }
      })
    }
    /** Writes request into routes.txt file as a string
      */
    else if (path == "/routes.txt") {
      var requestBody = [];
      request.on("data", function(chunk) {
        requestBody.push(chunk);
      }).on("end", function() {
        //requestBody = Buffer.concat(requestBody).toString();
      });
      var writeOptions = {
        flag: "a"
      };
      fs.writeFile("../routes.txt", requestBody, writeOptions, function(err) {
        if (err) {
          console.log("Failed to write to txt due to:" + err);
        }
        else {
          response.writeHead(200);
          response.end();
          console.log("File written");
        }
      });
    }
    /** Loads client side js
      */
    else if (path == "/compiled/app/index.js") {
      fs.readFile("../compiled/app/index.js", function(err, file){
        if (err) {
          console.log("Client side JS could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": "json"});
          response.end(file, "utf-8");
        }
      });
    }
    /** Loads client side css
      */
    else if (path == "/app/style.css") {
      fs.readFile("../app/style.css", function(err, file){
        if (err) {
          console.log("Client side CSS could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": "text/css"});
          response.end(file, "utf-8");
        }
      });
    }
    /** Loads react
      */
    else if (path == "/node_modules/react/dist/react.js") {
      fs.readFile("../node_modules/react/dist/react.js", function(err, file){
        if (err) {
          console.log("React library could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": 'json'});
          response.end(file, "utf-8");
        }
      });
    }
    else if (path == "/node_modules/react-dom/dist/react-dom.js") {
      fs.readFile("../node_modules/react-dom/dist/react-dom.js", function(err, file){
        if (err) {
          console.log("React-dom library could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": 'json'});
          response.end(file, "utf-8");
        }
      });
    }
    else if (path == "/compiled/components/App.jsx") {
      fs.readFile("../compiled/components/App.js", function(err, file){
        if (err) {
          console.log("App component could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": 'json'});
          response.end(file, "utf-8");
        }
      });
    }
    else if (path == "/compiled/components/Input.jsx") {
      fs.readFile("../compiled/components/Input.js", function(err, file){
        if (err) {
          console.log("Input component could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": 'json'});
          response.end(file, "utf-8");
        }
      });
    }
    else if (path == "/compiled/components/Results.jsx") {
      fs.readFile("../compiled/components/Results.js", function(err, file){
        if (err) {
          console.log("Results component could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": 'json'});
          response.end(file, "utf-8");
        }
      });
    }
    else if (path == "/compiled/components/SearchSort.jsx") {
      fs.readFile("../compiled/components/SearchSort.js", function(err, file){
        if (err) {
          console.log("SearchSort component could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": 'json'});
          response.end(file, "utf-8");
        }
      });
    }
    else if (path == "/compiled/components/StopPoints.jsx") {
      fs.readFile("../compiled/components/StopPoints.js", function(err, file){
        if (err) {
          console.log("StopPoints component could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": 'json'});
          response.end(file, "utf-8");
        }
      });
    }
    else if (path == "/compiled/components/YelpSearch.jsx") {
      fs.readFile("../compiled/components/YelpSearch.js", function(err, file){
        if (err) {
          console.log("YelpSearch component could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": 'json'});
          response.end(file, "utf-8");
        }
      });
    }
    else if (path == "/compiled/components/SearchResult.jsx") {
      fs.readFile("../compiled/components/SearchResult.js", function(err, file){
        if (err) {
          console.log("YelpSearch component could not be loaded due to: " + err);
        }
        else {
          response.writeHead(200, {"Content-Type": 'json'});
          response.end(file, "utf-8");
        }
      });
    }
    /** Loads index.html
      */
    else {
      fs.readFile("../app/index.html", function(err, file){
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
/** Enables server port to be read from the environment
  * for heroku or defaults to 8000.
  */
server.listen(process.env.PORT || 8000, function () {
  if (process.env.PORT) {
    console.log('Server is listening at port ' + process.env.PORT);
  } else {
    console.log('Server is listening at port 8000');
  }
  
});
