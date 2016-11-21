var StopPoints = (props) => (
  <p>Number of Stops<input id="numOfStops" type= "number" value= {1} className="numBox" /> 
    <input type= "button" value= "Calculate Stops" onClick= { () => getStoppoints()} /> 
  </p>
);

window.StopPoints = StopPoints;