var map;
var router;
var geocoder;
var directionsDisplay;
var start;
var stop;
var markers = [];
var stopPoints;
var directionsResults;
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
      initMap();
    }
    else console.log("Google Maps failed to load.");
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
  directionsDisplay = new google.maps.DirectionsRenderer();
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
}

/** clearMarkers() iterates through the markers array and uses 
  * setMap() to erase its presence from the map and also clears the
  * entire markers array.
  */
function clearMarkers() {
  if (markers.length > 0) {
    for (var i = 0; i < markers.length; i ++) {
      markers[i].setMap(null);
    }
    markers = [];
  }
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
      console.log(results);
      directionsResults = results;
      directionsDisplay.setDirections(results);
      directionsDisplay.setPanel(document.getElementById("textDirections"));
    }
    else {
       alert("Directions query was unsuccessful for the following reasons: " + status);
    }
  });
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
  clearMarkers();
  var totalDistance = sumOf(directionsResults.routes[0].legs, "distance", "value");
  var numOfStops = Number(document.getElementById('numOfStops').value);
  var stops = [];
  for (var i = 1; i < numOfStops+1; i++) {
    stops.push((totalDistance/(numOfStops+1))*i);
  }
  var distanceTraveled = 0;
  var steps = []; 
  for (var i = 0; i < directionsResults.routes[0].legs.length; i++) {
    for (var j = 0; j < directionsResults.routes[0].legs[i].steps.length; j++) {
    steps.push(directionsResults.routes[0].legs[i].steps[j]);
    }
  }
  var i = 0;
  var j = 0;
  for (var k = 0; k < numOfStops; k++) {
    distanceToTravel = stops[k];
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

/** getGeocode(inputGeocode, infoWindow) retrieves the 
  * formatted_address of the inputGeocode and sets the infoWindow
  * to display the returned address.
  */
function reverseGeocode(inputGeocode, infoWindow) {
  geocoder.geocode( { 'location': inputGeocode}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      infoWindow.setContent(results[0].formatted_address);
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
  xmlhttp = new XMLHttpRequest();
  var yelpSearchTerm = document.getElementById("yelpSearchTerm").value;
  var stopToSearch = document.getElementById("stopToSearch").value;
  if (stopToSearch > markers.length || stopToSearch == 0 || stopToSearch < 0) {
    alert("Stop does not exist. Please select another stop.");
  }
  else { 
    markers[stopToSearch-1].setAnimation(google.maps.Animation.BOUNCE);
    xmlhttp.open("GET","/search?query=" + yelpSearchTerm + "+" + markers[stopToSearch-1].position.lat() + "," + markers[stopToSearch-1].position.lng(), true);
    xmlhttp.onreadystatechange = function () { 
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
        yelpResults = JSON.parse(xmlhttp.responseText);
        displayResults(JSON.parse(xmlhttp.responseText));
        setTimeout(function() {
          markers[stopToSearch-1].setAnimation(null);
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
    stopover: true});
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
  * in the resultsContent div in resultsContainer.
  */
function displayResults(searchResults) { 
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
        var yelpImage = createElement("img");
        yelpImage.src = searchResults.businesses[i].image_url;
        document.getElementById("yelpImageContainer"+i).appendChild(yelpImage);
      
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
      businessName.href = searchResults.businesses[i].url;
      businessName.target = "_blank";
      document.getElementById("businessNameDiv"+i).appendChild(businessName);
      
      /** rating is the yelp review stars image from the returned 
        * searchResults object.
        */
      var rating = createElement("img", "ratingClass");
      rating.src = searchResults.businesses[i].rating_img_url;
      document.getElementById("ratingDiv"+i).appendChild(rating);

      /** reviewCount is a p element holding the number of yelp
        * reviews of the business.
        */
      var reviewCount = createElement("p", "reviewCountClass", "", searchResults.businesses[i].review_count + " reviews");
      document.getElementById("ratingDiv"+i).appendChild(reviewCount);

      /** snippetImg is the image of the yelp review snippet
        */
      var snippetImg = createElement("img", "snippetImgClass");
      snippetImg.src = searchResults.businesses[i].snippet_image_url;
      document.getElementById("snippetTextDiv"+i).appendChild(snippetImg);
      
      /** snippetContainer is the div that contains snippetText
        */
      var snippetContainer = createElement("div", "snippetContainerClass", "snippetContainer"+i);
      document.getElementById("snippetTextDiv"+i).appendChild(snippetContainer);
      
      /** snippetText is the snippet of the yelp review that has been
        * shortened with slice to only include 61 chars.
        */
      var snippetText = createElement("p", "snippetTextClass", "snippetText"+i, searchResults.businesses[i].snippet_text.slice(0,60));
      document.getElementById("snippetContainer"+i).appendChild(snippetText);

      /** readMoreLink adds a link to the business yelp page at
        * the end of snippetText.
        */
      var readMoreLink = createElement("a", "readMoreLinkClass", "", "...read more");
      readMoreLink.href = searchResults.businesses[i].url;
      readMoreLink.target = "_blank";
      document.getElementById("snippetText"+i).appendChild(readMoreLink);
      
      /** btnAddToRoute is a button that runs function addStop() when
        * clicked.
        */
      var btnAddToRoute = createElement("button", "btnAddToRouteClass", "", "Add To Route");
      btnAddToRoute.value = i;
      btnAddToRoute.addEventListener("click", function () {
        addStop(this.value);
      });
      document.getElementById("businessNameDiv"+i).appendChild(btnAddToRoute);
  }
}