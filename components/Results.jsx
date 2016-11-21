var Results = (props) => (
  <div id= 'resultsContainer'>
    <div id= 'resultsContent'>
    {props.searchedResults.map((result) => <SearchResultEntry result={result}/>)}
    </div>
  </div>
);

window.Results = Results;