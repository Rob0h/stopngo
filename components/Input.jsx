var Input = (props) => (
  <div id='inputDir'>
    <StopPoints />
    <YelpSearch getYelp={props.getYelp}/>
    <SearchSort sortResults={props.sortResults}/>
  </div>
);

window.Input = Input;