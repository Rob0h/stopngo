class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchedResults: null
    };
  }

  getYelp() {
    var context = this;
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
          // REMOVE 
          console.log(yelpResults);
          context.setState({
            searchedResults: yelpResults.businesses
          });
          console.log('getting here');
          setTimeout(function() {
            markers[stopToSearch+1].setAnimation(null);
          }, 1000);
        }
      }
    xmlhttp.send();
    }
  }

  render() {
    return (
      <div>
        <Input getYelp={this.getYelp.bind(this)}/>
        <Results searchedResults={this.state.searchedResults ? this.state.searchedResults : exampleData}/>
      </div>
    )
  }
}