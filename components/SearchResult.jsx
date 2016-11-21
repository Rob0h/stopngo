var SearchResult = (props) => (
  <div className= 'yelpEntryClass'>
    <div className= 'yelpImageContainerClass'>
      <img src= {}>
      <button className= 'btnAddToRouteClass' onClick= {}></button>
    </div>
    <div className= 'businessDiv'>
      // holds businessName
      <div className= 'businessNameDiv'>
        <a href= {} text={}></a>
      </div>
      // holds rating and reviewCount
      <div className= 'ratingDivClass'>
        // rating
        <img src= {}>
        // reviewCount
        <p text={}>
      </div>
      // holds snippetImg and snippetContainer
      <div className= 'snippetTextClass'>
        // snippetImg
        <img src= {}>
        // snippetContainer
        <div className= 'snippetContainerClass'>
          <p className= 'snippetTextClass' text= {}></p>
        </div>
      </div>
    </div>
  </div>
);

window.SearchResult = SearchResult;