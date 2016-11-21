var Input = (props) => (
  <div>
    <StopPoints />
    <YelpSearch getYelp={props.getYelp}/>
    <SearchSort />
  </div>
);

window.Input = Input;