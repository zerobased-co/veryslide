import View from './View';

class Dialog extends View {
  constructor(state) {
    super({
      className: 'vs-dialog vs-hidden',
      ...state,
    });

    this.overlay = null;
    this.addEventListener('keydown', this.keydown, document);
  }

  render() {
    super.render();
  }

  keydown(event) {
    if (event.keyCode === 27) {
      event.preventDefault();
      this.close();
    }
  }

  modal() {
    if (this.parent == null) return;

    this.overlay = document.createElement('div');
    this.overlay.className = 'vs-dialog-overlay';
    this.parent.appendChild(this.overlay);

    this.show();
    this.node.focus();
    this.centerize();
  }

  close() {
    this.parent.removeChild(this.overlay);
    this.hide();
    this.destroy();
  }
}

export default Dialog
