class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchedResults: null
    };
  }

  render() {
    return (
      <div>
        <Input />
        <Results />
      </div>
    )
  }
}