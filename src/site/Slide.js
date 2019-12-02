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
      progress: '',
    };

    this.slideId = props.match.params.id;
    this.veryslideRef = React.createRef();
  }

  componentDidMount() {
    this.props.firebase.slide(this.slideId).get().then(doc => {
      if (doc.exists) {

        const data = doc.data();
        let slideData = {};

        if (data.info != null && data.info.latestRevision != null) {
          // get latest revision
          //let loaded = 0;
          //let totalPages = data.info.totalPages;
          let latestRevisionRef = this.props.firebase.slide(this.slideId).collection('revisions').doc(data.info.latestRevision);

          latestRevisionRef.get().then(slide => {
            slideData = slide.data().data;
            slideData.pages = [];

            // get all pages
            latestRevisionRef.collection('pages').get().then(qs => {

              qs.forEach(page => {
                //console.log(page.id, page.data());
                slideData.pages.push(page.data());
                //loaded += 1;
              });

              // let's initiate
              this.veryslide = new Veryslide({
                target: this.veryslideRef.current,
                info: data.info || {},
                data: slideData,
                slideId: this.slideId,
                firebase: this.props.firebase,
              });
              this.setState({loaded: true});
            });
          });
        } else {
          // for old type
          slideData = data.data;
          if (slideData != null) {
            if (typeof slideData === 'string') {
              slideData = JSON.parse(slideData);
            }
          } else {
            slideData = {}
          }
          this.veryslide = new Veryslide({
            target: this.veryslideRef.current,
            info: data.info || {},
            data: slideData,
            slideId: this.slideId,
            firebase: this.props.firebase,
          });
          this.setState({loaded: true});
        }
      }
      else {
        // TBD: then create one on the fly?
      }
    });
  }

  componentWillUnmount() {
    this.veryslide.destroy();
  }

  render() {
    return (
      <div>
        {!this.state.loaded &&
          <div className='Loading'>Loading slide... {this.state.progress}</div>
        }
        <div className='Veryslide' ref={this.veryslideRef} />
      </div>
    );
  }
}

class SlideNewForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 1024,
      height: 768,
      title: '',
      customSize: false,
    };
  }

  onSubmit = (event) => {
    let info = {
      title: this.state.title,
      width: parseInt(this.state.width),
      height: parseInt(this.state.height),
    };
    this.props.action(info);
  }

  handleSize = (event) => {
    let size = event.target.value;
    if (size === 'custom') {
      this.setState({customSize: true});
    } else {
      let [width, height] = size.split('x');

      this.setState({
        customSize: false,
        width,
        height,
      });
    }
  }

  handleTitle = (event) => {
    this.setState({title: event.target.value});
  }

  handleWidth = (event) => {
    this.setState({width: event.target.value});
  }

  handleHeight = (event) => {
    this.setState({height: event.target.value});
  }

  render() {
    const sizeList = [
        {'width': 1024, 'height': 768, 'name': 'Standard'},
        {'width': 1024, 'height': 1024, 'name': 'Square'},
        {'width': 1600, 'height': 900, 'name': 'Wide'},
        {'width': 1920, 'height': 1200, 'name': 'HD'},
      ].map((size) =>
      <option key={size.name} value={`${size.width}x${size.height}`}>{size.width} x {size.height} ({size.name})</option>
    );

    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <div className="InputGroup">
            <i className="fas fa-edit"/>
            <input name="title" value={this.state.title} onChange={this.handleTitle} type="text" placeholder="Slide Title" />
          </div>
          <div className="InputGroup">
            <i className="fas fa-arrows-alt"/>
            <select name="size" onChange={this.handleSize}>
              {sizeList}
              <option value="custom">Custom size...</option>
            </select>
          </div>
          {this.state.customSize &&
            <div className="InputGroup">
              <i className="fas fa-expand"/>
              <input name="width" value={this.state.width} onChange={this.handleWidth} type="number" placeholder="Width" />
              <i className="fas fa-times"/>
              <input name="height" value={this.state.height} onChange={this.handleHeight} type="number" placeholder="Height" />
            </div>
          }
          <button className="Primary" type="submit">
            <i className="fas fa-magic"/>
            Create
          </button>
        </form>
      </div>
    );
  }
}


class SlideNewBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  createSlide = (info) => {
    this.setState({loading: true});

    this.props.firebase.newSlide(info).then(slide => {
      const url = generatePath(ROUTES.SLIDE, { id: slide.id });
      this.props.history.replace(url);
    }).catch(function(error) {
        console.log("Error creating document:", error);
    });
  }

  render() {
    return (
      this.state.loading ?

      <div className="Loading">
        Now creating a new document...
      </div>

      :

      <div className="Center">
        <div>
          <h2>Create new slide</h2>
          <SlideNewForm action={this.createSlide}/>
        </div>
      </div>
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
