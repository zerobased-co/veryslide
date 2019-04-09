import Editor from './components/editor';

class Veryslide {
  constructor(target, options) {
    this.target = target;
    this.options = options;
    console.log(this.options);
  }
}

window.Veryslide = Veryslide;
