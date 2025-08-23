import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generatePath } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faList, faTh } from '@fortawesome/free-solid-svg-icons'

import { withFirebase } from './Firebase';
import { AuthUserContext, withAuthorization } from './Session';
import * as ROUTES from './constants/routes';


const HomeBase = ({ firebase }) => {
  const [slides, setSlides] = useState(null);
  const [viewMode, setViewMode] = useState('thumbnail'); // 'thumbnail' or 'list'

  useEffect(() => {
    const loadSlides = async () => {
      const slidesSnapshot = await firebase.mySlides();
      let loadedSlides = [];
      slidesSnapshot.forEach((slide) => {
        loadedSlides.push({id: slide.id, data: slide.data()});
      });
      setSlides(loadedSlides);
    };

    loadSlides();
  }, [firebase]);

  const deleteSlide = async (id) => {
    console.log("deleteSlide", id);
    await firebase.deleteSlide(id);

    setSlides(prevSlides => prevSlides.filter(el => el.id != id));
  };

  const duplicateSlide = (id) => {
    console.log("duplicateSlide", id);
  };

  const slideComponent = (slide) => {
    const isListView = viewMode === 'list';

    if (slide.data.info != null) {
      if (slide.data.info.totalPages != null) {
        return <div className={`Slide ${isListView ? 'ListView' : ''}`}>
          {slide.data.info.thumbnail ?
          <img src={slide.data.info.thumbnail} />
          :
          ''
          }
          <div className="SlideInfo">
            <span className="SlideTitle">{slide.data.info.title || slide.id}</span>
            <span className="SlidePages">{slide.data.info.totalPages} page(s)</span>
          </div>
        </div>
      } else if(slide.data.data != null) {
        return <div className={`Slide ${isListView ? 'ListView' : ''}`}>
          {slide.data.data.pages.length > 0 ?
          <img src={slide.data.data.pages[0].thumbnail} />
          :
          ''
          }
          <div className="SlideInfo">
            <span className="SlideTitle">{slide.data.info.title || slide.id}</span>
            <span className="SlidePages">{slide.data.data.pages.length} page(s)</span>
          </div>
        </div>
      }
    }

    return <span>{slide.id}</span>
  };

  return (
    <AuthUserContext.Consumer>
      {authUser => (
        <div>
          <div className="SlidesListMenu">
            <h2>My slides</h2>
            <div className={`ViewToggle ${viewMode === 'list' ? 'list-active' : ''}`}>
              <button
                className={`ViewToggleBtn ${viewMode === 'thumbnail' ? 'active' : ''}`}
                onClick={() => setViewMode('thumbnail')}
                title="Thumbnail view"
              >
                <FontAwesomeIcon icon={faTh} />
              </button>
              <button
                className={`ViewToggleBtn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <FontAwesomeIcon icon={faList} />
              </button>
            </div>
          </div>
          <ul className={`Slides ${viewMode === 'list' ? 'ListView' : 'ThumbnailView'}`}>{
            slides == null ?
            <p>Loading...</p>
            :
            slides.length == 0 ?
            <p>No slide found.</p>
            :
            slides.map((slide, idx) => {
              const url = generatePath(ROUTES.SLIDE, { id: slide.id });
              return (
                <li key={slide.id}>
                  <Link to={url}>
                    {slideComponent(slide)}
                  </Link>
                  <a className="Button NoText NoBorder" alt="Delete" onClick={() => deleteSlide(slide.id)}>
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </a>
                </li>
              )
            }
          )}
          </ul>
        </div>
      )}
    </AuthUserContext.Consumer>
  );
}


const condition = authUser => !!authUser;

const Home = withFirebase(withAuthorization(condition)(HomeBase));

export default Home;