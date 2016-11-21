var SearchResultEntry = (props) => (
  <div className= 'yelpEntryClass'>
    <div className= 'yelpImageContainerClass'>
      <img src= {props.result.image_url}/>
    </div>
    <div className= 'businessDivClass'>
      <div className= 'businessNameDivClass'>
        <a href= {props.result.url} target='_blank'>{props.result.name}</a>
      </div>
      <div className= 'ratingDivClass'>
        <img className= 'ratingClass' src= {props.result.rating_img_url}/>
        <p>{props.result.review_count} Reviews</p>
      </div>
      <div className= 'snippetTextClass'>
        <img className= 'snippetImgClass' src= {props.result.snippet_image_url}/>
        <div className= 'snippetContainerClass'>
          <p className= 'snippetTextClass'>{props.result.snippet_text.slice(0, 65)}
            <a className= 'readMoreLinkClass' href={props.result.url} target='_blank'>...read more</a>
          </p>
        </div>
      </div>
    </div>
  </div>
);

window.SearchResultEntry = SearchResultEntry;