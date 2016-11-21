var map;
var router;
var geocoder;
var directionsDisplay;
var start;
var stop;
/* Array to hold all markers
 */
var markers = [];
var stopPoints;
var directionsResults;

/** yelpResults holds the results from the yelp query
  */
var yelpResults;

var wayPoints = [];

/** loadApp() requests the google maps API key from config.txt and 
  * loads the google maps script.
  */
function loadApp() {
  var gMaps = document.createElement("script");
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "/gMapsKey", true);
  var gMapsKey;
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      gMapsKey = xmlhttp.responseText;
      gMaps.src = "https://maps.googleapis.com/maps/api/js?key=" + gMapsKey + "&callback=initMap";
      document.getElementsByTagName("body")[0].appendChild(gMaps);
      gMaps.onload = function () {
        initMap();
      }
    }
  };
  xmlhttp.send();
}

/** initMap() creates a geocoder, router, and directionsDisplay for
  * maps API. Centers map at current position if browser supports 
  * geolocation. If not, centers the map at Irvine, CA.
  */ 
function initMap() {
  geocoder = new google.maps.Geocoder();
  router = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer({
    suppressInfoWindows: true,
    suppressMarkers: true
  });
  var latlng = new google.maps.LatLng(33.662004, -117.82090700000003);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var latlng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    });
  }
  var mapOptions = {
    zoom: 8,
    center: latlng
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsDisplay.setMap(map);
  ReactDOM.render(<App />, document.getElementById('app'));
}

/** clearMarkers(saveMarkers) iterates through the markers array and 
  * saveMarkers array backwards and removes markers which index is not found
  * in the saveMarkers array. If found, j is decremented.
  */
function clearMarkers(saveMarkers) {
  if (typeof(saveMarkers) == "undefined") {
    var keepMarkers = false;
  }
  else {
    var keepMarkers = true;
    var j = saveMarkers.length-1;
  }
  if (markers.length > 0) {
    for (var i = markers.length-1; i > -1; i--) {
      if (keepMarkers) {
          if (saveMarkers[j] == i) {
            j--;
          }
          else {
            markers[i].setMap(null);
            markers.splice(i,1);
          }
      }
      else {
        markers[i].setMap(null);
        markers.splice(i,1);
      }
    }
  }
  console.log(markers);
}

/** getDirections(waypts) creates a request object which is passed 
  * to router to retrieve the DirectionsResult between the user
  * inputted start and stop.
  * The resulting DirectionsResult is rendered in the div- 
  * textDirections. If the router fails, an alert is displayed.
  */
function getDirections(waypts) {
  if (start !== document.getElementById("start").value || stop !== document.getElementById("stop").value) {
    clearMarkers();
    wayPoints = [];
  }
  start = document.getElementById("start").value;
  stop = document.getElementById("stop").value;
  var request = {
    origin: start,
    destination: stop,
    waypoints: waypts,
    travelMode: google.maps.TravelMode.DRIVING
  };
  router.route(request, function(results, status){
    if (status == google.maps.DirectionsStatus.OK) {
      getGeocode(start, function(location) {
        createMarker(location, "Start: " + start);
      });
      console.log("added in start" + markers);
      getGeocode(stop, function(location) {
        createMarker(location, "Stop: " + stop);
      });
      console.log("added in stop" + markers);
      directionsResults = results;
      directionsDisplay.setDirections(results);
      /*directionsDisplay.setPanel(document.getElementById("textDirections"));*/
    }
    else {
       alert("Directions query was unsuccessful for the following reasons: " + status);
    }
  });
}

/* createMarker(location, text) creates a new marker object and adds it
 * to the markers array. The text is used to populate the infoWindow that
 * opens when the marker is clicked.
 */
function createMarker(location, text) {
  var createdMarker = new google.maps.Marker({
    position: new google.maps.LatLng(location.lat, location.lng),
    map: map
  });
  var infoWindow = new google.maps.InfoWindow({
    content: text
  });
  createdMarker.addListener("click", function() {
    infoWindow.open(map, createdMarker);
  });
  markers.push(createdMarker);
}

/** sumOf(array, property, property1) iterates through the array
  * and takes the sum of the array.property.property1 values if
  * property and property1 are true.
  */
function sumOf(array, property, property1) {
  var sum = 0;
  array.forEach(function(element, index, array) {
    sum += element[property][property1];
  })
  return sum;
}

/** getStoppoints() calculates the totalDistance of the route by 
  * using sumOf() to iterate through all the legs.distance.value of
  * the route. The stops array is then created by calculating the 
  * distance needed to travel for each stop with numOfStops. 
  * The steps array is then created by combining all the steps for
  * each leg of the route.
  * Each element is then iterated through in the steps array and
  * the distanceTraveled incremented based on pathDistance until
  * the value passes the distanceToTravel, which is from the stops
  * array. When distanceToTravel is passed, a marker is added to the
  * markers array at steps[i].path[j].
  */
function getStoppoints() {
  if (typeof directionsResults == 'undefined') {
    alert('Please get directions before checking for stops.');
  }
  else {
        clearMarkers([0,1]);
        var totalDistance = sumOf(directionsResults.routes[0].legs, "distance", "value");
        var numOfStops = Number(document.getElementById('numOfStops').value);
        var stops = [];
        for (var i = 1; i < numOfStops+1; i++) {
          stops.push((totalDistance/(numOfStops+1))*i);
        }
        var distanceTraveled = 0;
        var steps= []; 
        for (var i = 0; i < directionsResults.routes[0].legs.length; i++) {
          steps= steps.concat(directionsResults.routes[0].legs[i].steps);
        }
        var i = 0;
        var j = 0;
        for (var k = 0; k < numOfStops; k++) {
          var distanceToTravel = stops[k];
          while (distanceTraveled < distanceToTravel) {
            var pathDistance = steps[i].distance.value/(steps[i].path.length);
            distanceTraveled += pathDistance;
            if (j < steps[i].path.length-1) {
              j++;
            }
            else if (j == steps[i].path.length-1 && i < steps.length){
              i++;
              j = 0;
            }
          }
          /*console.log(steps[i].path[j]);
          reverseGeocode(steps[i].path[j], function(location) {
            createMarker(steps[i].path[j], "Stop # " + k+1 + location);
          });
          createMarker(steps[i].path[j], "Stop");*/
          markers.push(new google.maps.Marker({
            position: steps[i].path[j],
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            label: (k+1).toString()
          }));
          var infoWindow = new google.maps.InfoWindow({
          });
          markers[k].addListener("click", function() {
            reverseGeocode(this.position, infoWindow);
            infoWindow.open(map, this);
          });
          markers[k].addListener("dragend", function() {
            reverseGeocode(this.position, infoWindow);
            infoWindow.open(map, this);
          });
        }
  }
}

/** getGeocode(inputAddress)
  */
function getGeocode(inputAddress, callback) {
  geocoder.geocode({'address': inputAddress}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      callback ({
        lat: results[0].geometry.location.lat(),
        lng: results[0].geometry.location.lng()
      });
    }
  });
}

/** reverseGeocode(inputGeocode, infoWindow) retrieves the 
  * formatted_address of the inputGeocode and sets the infoWindow
  * to display the returned address.
  */
function reverseGeocode(inputGeocode, callback) {
  geocoder.geocode( { 'location': inputGeocode}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      callback(
        results[0].formatted_address
      );
      /**var contentString = "<p> Business Name </p>" + results[0].formatted_address;
      infoWindow.setContent(contentString);*/
     } 
    else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
} 

/** getYelp() creates a GET request with xmlhttp and the user
  * inputted yelpSearchTerm and stopToSearch and returns the 
  * result in yelpResults, which is then displayed using 
  * displayResults().
  */
function getYelp() {
  var xmlhttp = new XMLHttpRequest();
  var yelpSearchTerm = document.getElementById("yelpSearchTerm").value;
  var stopToSearch = Number(document.getElementById("stopToSearch").value);
  if (stopToSearch+1 > markers.length-1 || stopToSearch <= 0 || typeof stopToSearch == "undefined") {
    alert("Stop does not exist. Please select another stop.");
  }
  else { 
    var sortVal = document.getElementById("sortBy").value;
    markers[stopToSearch+1].setAnimation(google.maps.Animation.BOUNCE);
    xmlhttp.open("GET","/search?query=" + yelpSearchTerm + "+" + markers[stopToSearch+1].position.lat() + "," + markers[stopToSearch+1].position.lng() + "+" + sortVal, true);
    xmlhttp.onreadystatechange = function () { 
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
        yelpResults = JSON.parse(xmlhttp.responseText);
        displayResults(yelpResults);
        populateResults(yelpResults);
        setTimeout(function() {
          markers[stopToSearch+1].setAnimation(null);
        }, 1000);
      }
    }
  xmlhttp.send();
  }
}

/** saveRoute(saveContent) writes start/stop and waypts to routes.txt
  */
function saveRoute(routeNum) {
  var saveContent = {
    routeNum: routeNum,
    start: start, 
    stop: stop,
    waypts: wayPoints
  };
  saveContent = JSON.stringify(saveContent);
  console.log(saveContent);
  console.log(JSON.parse(saveContent));
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST","/routes.txt", true);
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      alert('Directions saved successfully');
    }
  }
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.send(saveContent);
}

/** getRoute(routeNum) retrieves route from routes.txt
  */ 
function getRoute(routeNum) {
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","/search?route=" + val, true);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      returnedRoute = JSON.parse(xmlhttp.responseText);
      console.log(returnedRoute);
    }
  }
  xmlhttp.send();
}

/** addStop(stopNumber) retrieves the address from the yelpResults
  * object returned from getYelp() based on the stopNumber and 
  * stores the address in stopAddress. stopAddress is then pushed
  * into the wayPoints array which is then pushed to getDirections()
  * to update the directions.
  */
function addStop(stopNumber) {
  var stopAddress = "";
  for (var i = 0; i < yelpResults.businesses[stopNumber].location.display_address.length; i++) {
    stopAddress += yelpResults.businesses[stopNumber].location.display_address[i] + " ";
  };
  wayPoints.push({
    location: stopAddress,
    stopover: true
  });
  getGeocode(stopAddress, function(location) {
    createMarker(location, yelpResults.businesses[stopNumber].name);
  })
  getDirections(wayPoints);
}

/** createElement(elementType,className,id,innerHTML) creates a
  * HTML with tag - elementType, class - className, id - id, 
  * innerHTML - innerHTML.
  */
function createElement(elementType, className, id, innerHTML) {
  var element = document.createElement(elementType);
  if (className) element.className = className;
  if (id) element.id = id;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

/** displayResults(searchResults) displays the searchResults
  * in the resultsContent div in resultsContainer. If the searchResults
  * is of a different length than previously input, the divs are re-
  * created based on the length of searchResults and populateResults is run.
  * However, if the length is the same, the function immediately runs
  * populateResults().
  */
function displayResults(searchResults) { 
  if (!document.getElementById(searchResults.length-1)) {
  while (document.getElementById("resultsContent").firstChild) {
    document.getElementById("resultsContent").removeChild(document.getElementById("resultsContent").firstChild);
  }
  for (var i = 0; i < searchResults.businesses.length; i++) {
    /** yelpEntry div is the highest level div to hold searchResults
      * in resultsContent.
      */
    var yelpEntry = createElement("div", "yelpEntryClass", "yelpEntry"+i);
    document.getElementById("resultsContent").appendChild(yelpEntry);

      /*yelpImageContainer div to hold the yelpImage
      */
      var yelpImageContainer = createElement("div", "yelpImageContainerClass", "yelpImageContainer"+i);
      document.getElementById("yelpEntry"+i).appendChild(yelpImageContainer);

        /*yelpImage is the yelp business image
        */
        var yelpImage = createElement("img", "", "yelpImg"+i);
        var yelpImageSpan = createElement("span", "", "span"+i);
        document.getElementById("yelpImageContainer"+i).appendChild(yelpImage);
        document.getElementById("yelpImageContainer"+i).appendChild(yelpImageSpan);
      
      /** businessDiv holds businessnameDiv, ratingDiv,
        * and snippetTextDiv.
        */ 
      var businessDiv = createElement("div", "businessDivClass", "businessDiv"+i);
      document.getElementById("yelpEntry"+i).appendChild(businessDiv);

        /** businessNameDiv holds businessName
          */
        var businessNameDiv = createElement("div", "businessNameDivClass", "businessNameDiv"+i);
        document.getElementById("businessDiv"+i).appendChild(businessNameDiv);
        /** ratingDiv holds rating and reviewCount
          */
        var ratingDiv = createElement("div", "ratingDivClass", "ratingDiv"+i);
        document.getElementById("businessDiv"+i).appendChild(ratingDiv);
        /** snippetTextDiv holds snippetImg and snippetContainer
          */
        var snippetTextDiv = createElement("div", "snippetTextClass", "snippetTextDiv"+i);
        document.getElementById("businessDiv"+i).appendChild(snippetTextDiv);

      /** businessName is both the business name and acts as
        * a link to the business' yelp page.
        */ 
      var businessName = createElement("a","","business"+i, searchResults.businesses[i].name);
      businessName.target = "_blank";
      document.getElementById("businessNameDiv"+i).appendChild(businessName);
      
      /** rating is the yelp review stars image from the returned 
        * searchResults object.
        */
      var rating = createElement("img", "ratingClass", "rating"+i);
      document.getElementById("ratingDiv"+i).appendChild(rating);

      /** reviewCount is a p element holding the number of yelp
        * reviews of the business.
        */
      var reviewCount = createElement("p", "reviewCountClass", "reviewCount"+i, searchResults.businesses[i].review_count + " reviews");
      document.getElementById("ratingDiv"+i).appendChild(reviewCount);

      /** snippetImg is the image of the yelp review snippet
        */
      var snippetImg = createElement("img", "snippetImgClass", "snippetImg"+i);
      document.getElementById("snippetTextDiv"+i).appendChild(snippetImg);
      
      /** snippetContainer is the div that contains snippetText
        */
      var snippetContainer = createElement("div", "snippetContainerClass", "snippetContainer"+i);
      document.getElementById("snippetTextDiv"+i).appendChild(snippetContainer);
      
      /** snippetText is the snippet of the yelp review that has been
        * shortened with slice to only include 61 chars.
        */
      var snippetText = createElement("p", "snippetTextClass", "snippetText"+i);
      document.getElementById("snippetContainer"+i).appendChild(snippetText);
      
      /** btnAddToRoute is a button that runs function addStop() when
        * clicked.
        */
      var btnAddToRoute = createElement("button", "btnAddToRouteClass", "", "Add To Route");
      btnAddToRoute.value = i;
      btnAddToRoute.addEventListener("click", function () {
        addStop(this.value);
      });
      document.getElementById("span"+i).appendChild(btnAddToRoute);
  }
    populateResults(searchResults);
  }
  /** Runs populateResults if the length of searchResults is the 
    * same as the previous instance.
    */
  else {
    populateResults(searchResults);
  }
}

/** populateResults(searchResults) populates the format created
  * by displayResults(searchResults)
  */
function populateResults(searchResults) {
  for (var i = 0; i < searchResults.businesses.length; i++) {
    document.getElementById("yelpImg"+i).src = searchResults.businesses[i].image_url;
    document.getElementById("business"+i).innerHTML = searchResults.businesses[i].name;
    document.getElementById("business"+i).href = searchResults.businesses[i].url;
    document.getElementById("rating"+i).src = searchResults.businesses[i].rating_img_url;
    document.getElementById("reviewCount"+i).innerHTML = searchResults.businesses[i].review_count + " reviews"
    document.getElementById("snippetImg"+i).src = searchResults.businesses[i].snippet_image_url;
    document.getElementById("snippetText"+i).innerHTML = searchResults.businesses[i].snippet_text.slice(0,65);
      /** readMoreLink adds a link to the business yelp page at
        * the end of snippetText.
        */
      var readMoreLink = createElement("a", "readMoreLinkClass", "readMoreLink"+i, " ...read more");
      readMoreLink.href = searchResults.businesses[i].url;
      readMoreLink.target = "_blank";
      document.getElementById("snippetText"+i).appendChild(readMoreLink);
  }
}

/** sortResults(searchResults) sorts the results to be descending
  * based on review_count
  */
function sortResults(searchResults) {
  searchResults.businesses.sort(function(a,b) {
    return b.review_count-a.review_count;
  });
  console.log(searchResults);
  populateResults(searchResults);
}

/** filterResults(searchResults) filteres the results based on the
  * user selected value of filterStars
  */
function filterResults(searchResults) {
  var filterVal = document.getElementById("filterStars").value;
  var filteredYelp = {
    businesses: searchResults.businesses.filter(function(business) {
      return business.rating >= filterVal;
    })
  };
  displayResults(filteredYelp);
}