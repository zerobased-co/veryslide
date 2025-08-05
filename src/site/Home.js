import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generatePath } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'

import { withFirebase } from './Firebase';
import { AuthUserContext, withAuthorization } from './Session';
import * as ROUTES from './constants/routes';


const HomeBase = ({ firebase }) => {
  const [slides, setSlides] = useState(null);

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
    if (slide.data.info != null) {
      if (slide.data.info.totalPages != null) {
        return <div className="Slide">
          {slide.data.info.thumbnail ?
          <img src={slide.data.info.thumbnail} />
          :
          ''
          }
          <span>{slide.data.info.title || slide.id}</span>
          <span>{slide.data.info.totalPages} page(s)</span>
        </div>
      } else if(slide.data.data != null) {
        return <div className="Slide">
          {slide.data.data.pages.length > 0 ?
          <img src={slide.data.data.pages[0].thumbnail} />
          :
          ''
          }
          <span>{slide.data.info.title || slide.id}</span>
          <span>{slide.data.data.pages.length} page(s)</span>
        </div>
      }
    }

    return <span>{slide.id}</span>
  };

  return (
    <AuthUserContext.Consumer>
      {authUser => (
        <div>
          <h2>My slides</h2>
          <ul className="Slides">{
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
