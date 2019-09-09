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

  componentDidMount() {
    this.props.firebase.currentUser().get().then(doc => {
      if (doc.exists) {
        this.setState({data: doc.data()});
      } else {
        console.log("No such document!");
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

    this.props.firebase.mySlides().get().then(qs => {
      let slides = [];
      qs.docs.map(slide => {
        slides.push({id: slide.id, data: slide.data()});
      });
      this.setState({slides});
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
  }

  deleteSlide(id) {
    console.log("deleteSlide", id);
    this.props.firebase.slide(id).delete().then(() => {
      this.setState(prevState => ({
        slides: prevState.slides.filter(el => el.id != id)
      }));
    }).catch(function(error) {
        console.log("Error deleting document:", error);
    });
  }

  render() {
    const slides = this.state.slides;

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <h2>My slides</h2>
            <ul>{
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
                      {(slide.data.info != null && slide.data.data != null) ?
                      <span>{slide.data.info.title || slide.id} ({slide.data.data.pages.length} page(s))
                        {slide.data.data.pages.length > 0 ?
                        <img src={slide.data.data.pages[0].thumbnail} />
                        :
                        ''
                        }
                      </span>
                      :
                      <span>{slide.id}</span>
                      }
                    </Link>
                    <a onClick={() => this.deleteSlide(slide.id)}>
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
