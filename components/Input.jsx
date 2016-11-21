var Input = (props) => (
  <div id='inputDir'>
    <StopPoints />
    <YelpSearch getYelp={props.getYelp}/>
    <SearchSort />
  </div>
);

window.Input = Input;