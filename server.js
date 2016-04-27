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
  fs.readFile("./config.txt", "utf-8", function(err, file) {
    if (err) {
      console.log("Yelp API keys were unable to be read due to:" + err);
    }
    else {
      var yelpKeys = JSON.parse(file);
      console.log(yelpKeys.consumer_secret);
      var yelp = new Yelp({
        consumer_key: yelpKeys.consumer_key,
        consumer_secret: yelpKeys.consumer_secret,
        token: yelpKeys.token,
        token_secret: yelpKeys.token_secret
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
      fs.writeFile("./routes.txt", requestBody, writeOptions, function(err) {
        if (err) {
          console.log("Failed to write to txt due to:" + err);
        }
        else console.log("File written");
      });
    }
    /** Loads client side js
      */
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
    /** Loads client side css
      */
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
    /** Loads index.html
      */
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
/** Enables server port to be read from the environment
  * for heroku or defaults to 8000.
  */
server.listen(process.env.PORT || 8000, function () {
  console.log("Server is listening...");
});
