import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { generatePath } from 'react-router';
import { compose } from 'recompose';
import IconTrash from '@iconscout/react-unicons/icons/uil-trash-alt'

import { withFirebase } from './Firebase';
import { AuthUserContext, withAuthorization } from './Session';
import * as ROUTES from './constants/routes';


class HomeBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      slides: [],
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
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <h2>My slides</h2>
            <ul>{
              this.state.slides.map((slide, idx) => {     
                const url = generatePath(ROUTES.SLIDE, { id: slide.id });
                return (
                  <li key={slide.id}>
                    <Link to={url}>ID: {slide.id}</Link>
                    <IconTrash size="20" onClick={() => this.deleteSlide(slide.id)} />
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
