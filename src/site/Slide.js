import React, { Component } from 'react';
import { generatePath } from 'react-router';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from './Firebase';
import * as ROUTES from './constants/routes';

import Veryslide from '../Veryslide';

class SlideBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };

    this.slideId = props.match.params.id;
    this.veryslideRef = React.createRef();
  }

  componentDidMount() {
    this.props.firebase.slide(this.slideId).get().then(doc => {
      if (doc.exists) {
        this.setState({loaded: true});

        const data = doc.data();
        this.veryslide = new Veryslide({
          target: this.veryslideRef.current,
          data: (data.data != null) ? JSON.parse(data.data) : null,
          slideId: this.slideId,
          firebase: this.props.firebase,
        });
      }
      else {
        // TBD: then create one on the fly?
      }
    }).catch(function(error) {
        console.log("Error retrieving document:", error);
    });
  }

  componentWillUnmount() {
    this.veryslide.destroy();
  }

  render() {
    return (
      <div>
        {this.state.loaded ? (
          <div className='Veryslide' ref={this.veryslideRef} />
        ) : (
          <p>Loading slide...</p>
        )}
      </div>
    );
  }
}

class SlideNewBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      slideId: null,
    };
  }

  componentDidMount() {
    this.props.firebase.newSlide().then(slide => {
      const url = generatePath(ROUTES.SLIDE, { id: slide.id });
      this.props.history.push(url);
    }).catch(function(error) {
        console.log("Error creating document:", error);
    });
  }

  render() {
    return (
      <p><strong>Now creating</strong> a new document...{this.state.slideId}</p>
    );
  }
}

const Slide = compose(
  withRouter,
  withFirebase,
)(SlideBase);

const SlideNew = compose(
  withRouter,
  withFirebase,
)(SlideNewBase);

export default Slide;

export { SlideNew };
