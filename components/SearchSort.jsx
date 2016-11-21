var SearchSort = (props) => (
  <p> Sort by: 
    <select id = "sortBy">
      <option value = {0}> Default </option>
      <option value = {1}> Distance </option>
      <option value = {2}> Rating </option>
    </select>
    <input type="button" value="Sort By Review Count" onClick={() => props.sortResults()} />
    <select id = "filterStars">
      <option value = {5}> 5 Star </option>
      <option value = {4}> 4 Star + </option>
      <option value = {3}> 3 Star + </option>
    </select>
    <input type="button" value="Test" onClick={() =>filterResults(yelpResults)} />
  </p>
);