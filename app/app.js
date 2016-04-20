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


// Creates a new Geocoder, DirectionsSerivce, and DirectionsRenderer. Also, creates a new Map centered at Irvine, CA
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

function clearMarkers() {
  if (markers.length > 0) {
    for (var i = 0; i < markers.length; i ++) {
      markers[i].setMap(null);
    }
    markers = [];
  }
}
// Based on the inputs to fields start and stop, getDirections creates a request for the router object to find the directions from start to stop. The result is then displayed on the map object via directionsDisplay, the directions renderer.
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
      directionsResults = results;
      directionsDisplay.setDirections(results);
      directionsDisplay.setPanel(document.getElementById("textDirections"));
    }
    else {
       alert("Directions query was unsuccessful for the following reasons: " + status);
    }
  });
}

function sumOf(array, property, property1) {
  var sum = 0;
  for (var i = 0; i < array.length; i++){
    var arrayVal = array[i];
    if (property) {
      var arrayVal = arrayVal[property];
      if (property1) {
        var arrayVal = arrayVal[property1];
      }
    }
    sum += arrayVal;
  }
  return sum;
}

// Based on the numOfStops, places markers at the approximate points based on the total distance calculated from the leg. distanceTraveled is increased based on the the distance of the step and the number of points in the path array. Once the distance is increased past the calculated stop point, the marker is placed.
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

// getGeocode retrieves the lat and lng of the input in field geoCode.
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

//creates yelp query based on input keyword and stop location
function getYelp() {
  xmlhttp = new XMLHttpRequest();
  var yelpSearchTerm = document.getElementById("yelpSearchTerm").value;
  var stopToSearch = document.getElementById("stopToSearch").value;
  if (stopToSearch > markers.length || stopToSearch == 0 || stopToSearch < 0) {
    alert("Stop does not exist. Please select another stop.");
  }
  else { 
    xmlhttp.open("GET","http://localhost:8000/search?query=" + yelpSearchTerm + "+" + markers[stopToSearch-1].position.lat() + "," + markers[stopToSearch-1].position.lng(), true);
    xmlhttp.onreadystatechange=function(){
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
        yelpResults = JSON.parse(xmlhttp.responseText);
        displayResults(JSON.parse(xmlhttp.responseText));
      }
    }
  xmlhttp.send();
  }
}

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

function createElement(elementType, className, id, innerHTML) {
  var element = document.createElement(elementType);
  if (className) element.className = className;
  if (id) element.id = id;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

function displayResults(searchResults) { 
  while (document.getElementById("resultsContent").firstChild) {
    document.getElementById("resultsContent").removeChild(document.getElementById("resultsContent").firstChild);
  }
  for (var i = 0; i < searchResults.businesses.length; i++) {
    //yelpEntry div
    var yelpEntry = createElement("div", "yelpEntryClass", "yelpEntry"+i);
    document.getElementById("resultsContent").appendChild(yelpEntry);
      //yelp image container
      var yelpImageContainer = createElement("div", "yelpImageContainerClass", "yelpImageContainer"+i);
      document.getElementById("yelpEntry"+i).appendChild(yelpImageContainer);
      
      //yelp business image
      var yelpImage = createElement("img");
      yelpImage.src = searchResults.businesses[i].image_url;
      document.getElementById("yelpImageContainer"+i).appendChild(yelpImage);
      
      //creates div to house
      var businessDiv = createElement("div", "businessDivClass", "businessDiv"+i);
      document.getElementById("yelpEntry"+i).appendChild(businessDiv);

      var businessNameDiv = createElement("div", "businessNameDivClass", "businessNameDiv"+i);
      document.getElementById("businessDiv"+i).appendChild(businessNameDiv);

      var ratingDiv = createElement("div", "ratingDivClass", "ratingDiv"+i);
      document.getElementById("businessDiv"+i).appendChild(ratingDiv);

      var snippetTextDiv = createElement("div", "snippetTextClass", "snippetTextDiv"+i);
      document.getElementById("businessDiv"+i).appendChild(snippetTextDiv);

      //name of yelp business, and acts as a link to the yelp business page
      var businessName = createElement("a","","business"+i, searchResults.businesses[i].name);
      businessName.href = searchResults.businesses[i].url;
      businessName.target = "_blank";
      document.getElementById("businessNameDiv"+i).appendChild(businessName);
      
      //picture of the yelp star rating
      var rating = createElement("img", "ratingClass");
      rating.src = searchResults.businesses[i].rating_img_url;
      document.getElementById("ratingDiv"+i).appendChild(rating);

      //review count
      var reviewCount = createElement("p", "reviewCountClass", "", searchResults.businesses[i].review_count + " reviews");
      document.getElementById("ratingDiv"+i).appendChild(reviewCount);

      //snippet image
      var snippetImg = createElement("img", "snippetImgClass");
      snippetImg.src = searchResults.businesses[i].snippet_image_url;
      document.getElementById("snippetTextDiv"+i).appendChild(snippetImg);
      
      //snippet text container
      var snippetContainer = createElement("div", "snippetContainerClass", "snippetContainer"+i);
      document.getElementById("snippetTextDiv"+i).appendChild(snippetContainer);
      
      //snippetText
      var snippetText = createElement("p", "snippetTextClass", "snippetText"+i, searchResults.businesses[i].snippet_text.slice(0,60));
      document.getElementById("snippetContainer"+i).appendChild(snippetText);

      //readMoreLink
      var readMoreLink = createElement("a", "readMoreLinkClass", "", "...read more");
      readMoreLink.href = searchResults.businesses[i].url;
      readMoreLink.target = "_blank";
      document.getElementById("snippetText"+i).appendChild(readMoreLink);
      
      //adds a route to button
      var btnAddToRoute = createElement("button", "btnAddToRouteClass", "", "Add To Route");
      btnAddToRoute.value = i;
      btnAddToRoute.addEventListener("click", function () {
        addStop(this.value);
      });
      document.getElementById("businessNameDiv"+i).appendChild(btnAddToRoute);
  }
}