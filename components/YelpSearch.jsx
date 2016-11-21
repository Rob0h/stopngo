var YelpSearch = (props) => (
  <p> Looking for:  
  <input id="yelpSearchTerm" type= "string" defaultValue= "food" className="stringBox" /> 
  at stop # 
  <input id="stopToSearch" defaultValue= '1' type= "number" className="numBox" /> 
  <input type="button" value="Go!" onClick={() => props.getYelp()} />
  <input type="button" value="Save" onClick={() => saveRoute()} />
  </p>
);

window.YelpSearch = YelpSearch;