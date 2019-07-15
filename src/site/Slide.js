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
        this.veryslide = new Veryslide(
          this.veryslideRef.current,
          (data.data != null) ? JSON.parse(data.data) : null
        );
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

  saveSlide(id) {
    let data = this.veryslide.serialize();

    // TBD: permission check
    this.props.firebase.slide(id).update({data}).then(() => {
      alert('Successfully saved.');
    }).catch(function(error) {
        console.log("Error saving document:", error);
    });
  }

  render() {
    return (
      <div>
        {this.state.loaded ? (
          <div>
            <h2>Slide {this.slideId}</h2>
            <button type="button" onClick={() => this.saveSlide(this.slideId)}>Save</button>
            <div className='Veryslide' ref={this.veryslideRef} />
          </div>
        ) : (
          <p>Loading...</p>
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
