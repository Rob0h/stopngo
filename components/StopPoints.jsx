var StopPoints = (props) => (
  <p>Number of Stops: <input id="numOfStops" defaultValue= '1' type= "number" className="numBox" /> 
    <input type= "button" value= "Calculate Stops" onClick= { () => getStoppoints()} /> 
  </p>
);

window.StopPoints = StopPoints;