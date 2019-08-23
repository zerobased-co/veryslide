import './Editor.scss';
import ui from './ui/UI';
import View from './ui/View';

class Player extends View {
  constructor(state) {
    super({
      className: 'vs-player',
      ...state,
    });

    this.page = null;

    this.keydownEvents = [
    // shift, ctrl,  alt,   meta,  keycodes, func
      [false, false, false, true,  [61, 187], () => this.applyStyle('Bigger')],
    ];
    this.keyupEvents = [
    // shift, ctrl,  alt,   meta,  keycodes, func
    ];

    ['keydown', 'keyup'].forEach(e => {
      this.addEventListener(e, this[e], window);
    }, this);

    this.addEventListener('mousedown', event => {
    });
  }

  keydown(event) {
    if (event.target !== document.body && event.target !== this.node) {
      return;
    }

    this.keydownEvents.forEach(item => {
      if (event.shiftKey === item[0] && event.ctrlKey === item[1] &&
          event.altKey === item[2] && event.metaKey === item[3] &&
          item[4].indexOf(event.keyCode) !== -1) {
        event.preventDefault();
        item[5](event);
      }
    });
  }

  keyup(event) {
    if (event.target !== document.body && event.target !== this.node) {
      return;
    }

    this.keyupEvents.forEach(item => {
      if (event.shiftKey === item[0] && event.ctrlKey === item[1] &&
          event.altKey === item[2] && event.metaKey === item[3] &&
          item[4].indexOf(event.keyCode) !== -1) {
        event.preventDefault();
        item[5](event);
      }
    });
  }

  render() {
    super.render();
    return this.node;
  }
}

export default Player
