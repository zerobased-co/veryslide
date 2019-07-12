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

    this.slideId = props.match.params.id;
    this.veryslideRef = React.createRef();
  }

  componentDidMount() {
    this.veryslide = new Veryslide(this.veryslideRef.current);
  }

  render() {
    return (
      <div>
        <h2>Slide {this.slideId}</h2>
        <div ref={this.veryslideRef}></div>
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
