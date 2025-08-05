import React, { Component } from 'react';
import { generatePath, useParams, useNavigate } from 'react-router-dom';
import { compose } from 'recompose';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faArrowsAlt, faExpand, faTimes, faMagic } from '@fortawesome/free-solid-svg-icons'

import { withFirebase } from './Firebase';
import { collection, doc, getDoc, getDocs, } from 'firebase/firestore';
import * as ROUTES from './constants/routes';

import Veryslide from '../Veryslide';

function SlideBase(props) {
  const { id } = useParams();
  const [loaded, setLoaded] = React.useState(false);
  const [progress, setProgress] = React.useState('');
  const veryslideRef = React.useRef();
  const db = props.firebase.db;
  const veryslideInstance = React.useRef(null);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchSlide() {
      const docSnap = await props.firebase.slide(id);
      if (!isMounted) return;
      if (docSnap.exists) {
        const data = docSnap.data();
        let slideData = {};

        if (data.info != null && data.info.latestRevision != null) {
          const latestRevRef = doc(db, 'slides', id, 'revisions', data.info.latestRevision);
          const latestRev = await getDoc(latestRevRef);

          slideData = latestRev.data().data;
          slideData.pages = [];

          const pagesRef = collection(latestRevRef, 'pages');
          const pages = await getDocs(pagesRef);
          pages.forEach(page => {
            slideData.pages.push(page.data());
          });

          veryslideInstance.current = new Veryslide({
            target: veryslideRef.current,
            info: data.info || {},
            data: slideData,
            slideId: id,
            firebase: props.firebase,
          });
          setLoaded(true);
        } else {
          slideData = data.data;
          if (slideData != null) {
            if (typeof slideData === 'string') {
              slideData = JSON.parse(slideData);
            }
          } else {
            slideData = {};
          }
          veryslideInstance.current = new Veryslide({
            target: veryslideRef.current,
            info: data.info || {},
            data: slideData,
            slideId: id,
            firebase: props.firebase,
          });
          setLoaded(true);
        }
      }
    }
    fetchSlide();
    return () => {
      isMounted = false;
      if (veryslideInstance.current) {
        veryslideInstance.current.destroy();
      }
    };
  }, [id, db, props.firebase]);

  return (
    <div>
      {!loaded &&
        <div className='Loading'>Loading slide... {progress}</div>
      }
      <div className='Veryslide' ref={veryslideRef} />
    </div>
  );
}

function SlideNewBase(props) {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const createSlide = async (info) => {
    setLoading(true);

    const docRef = await props.firebase.newSlide(info);
    const url = generatePath(ROUTES.SLIDE, { id: docRef.id });
    navigate(url, { replace: true });
  };

  return (
    loading ?
      <div className="Loading">
        Now creating a new document...
      </div>
      :
      <div className="Center">
        <div>
          <h2>Create new slide</h2>
          <SlideNewForm action={createSlide}/>
        </div>
      </div>
  );
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
    event.preventDefault();
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
            <FontAwesomeIcon icon={faEdit} />
            <input name="title" value={this.state.title} onChange={this.handleTitle} type="text" placeholder="Slide Title" />
          </div>
          <div className="InputGroup">
            <FontAwesomeIcon icon={faArrowsAlt} />
            <select name="size" onChange={this.handleSize}>
              {sizeList}
              <option value="custom">Custom size...</option>
            </select>
          </div>
          {this.state.customSize &&
            <div className="InputGroup">
              <FontAwesomeIcon icon={faExpand} />
              <input name="width" value={this.state.width} onChange={this.handleWidth} type="number" placeholder="Width" />
              <FontAwesomeIcon icon={faTimes} />
              <input name="height" value={this.state.height} onChange={this.handleHeight} type="number" placeholder="Height" />
            </div>
          }
          <button className="Primary" type="submit">
            <FontAwesomeIcon icon={faMagic} />
            Create
          </button>
        </form>
      </div>
    );
  }
}

const Slide = compose(
  withFirebase,
)(SlideBase);

const SlideNew = compose(
  withFirebase,
)(SlideNewBase);

export default Slide;

export { SlideNew };
