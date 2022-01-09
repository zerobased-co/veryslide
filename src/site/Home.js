import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { generatePath } from 'react-router';
import { compose } from 'recompose';

import { withFirebase } from './Firebase';
import { AuthUserContext, withAuthorization } from './Session';
import * as ROUTES from './constants/routes';


class HomeBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      slides: null,
    };
  }

  async componentDidMount() {
    const slidesSnapshot = await this.props.firebase.mySlides();
    let slides = [];
    slidesSnapshot.forEach((slide) => {
      slides.push({id: slide.id, data: slide.data()});
    });
    this.setState({slides});
  }

  async deleteSlide(id) {
    console.log("deleteSlide", id);
    await this.props.firebase.deleteSlide(id);

    this.setState(prevState => ({
      slides: prevState.slides.filter(el => el.id != id)
    }));
  }

  duplicateSlide(id) {
    console.log("duplicateSlide", id);
  }

  render() {
    const slides = this.state.slides;
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
                    <a className="Button NoText NoBorder" alt="Delete" onClick={() => this.deleteSlide(slide.id)}>
                      <i className="fas fa-trash-alt"/>
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
}


const condition = authUser => !!authUser;

const Home = compose(
  withFirebase,
  withAuthorization(condition),
)(HomeBase);

export default Home;
