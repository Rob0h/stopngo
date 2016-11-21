var YelpSearch = (props) => (
  <p> Looking for 
  <input id="yelpSearchTerm" type= "string" value= "food" className="stringBox" /> 
  at stop # 
  <input id="stopToSearch" type= "number" value= {1} className="numBox" /> 
  <input type="button" value="Go!" onClick={() => props.getYelp()} />
  <input type="button" value="Save" onClick={() => saveRoute()} />
  </p>
);

window.YelpSearch = YelpSearch;