import View from './ui/View'
import channel from 'core/Channel';
    
const minSize = 24;
const dotPreset = {
  'n': 'translate(-50%, -50%)',
  'e': 'translate(50%, -50%)',
  'w': 'translate(-50%, -50%)',
  's': 'translate(-50%, 50%)',
  'nw': 'translate(-50%, -50%)',
  'ne': 'translate(50%, -50%)',
  'se': 'translate(50%, 50%)',
  'sw': 'translate(-50%, 50%)',
};

class Handler extends View {
  constructor(state) {
    super({
      className: 'vs-handler',
      ...state,
    });

    this.object = null;
    this.viewport = null;
    this.transform = null;
    this.dragStart = undefined;
    this.basePos = undefined;
    this.baseSize = undefined;
    this.currentDot = null;
    this.handling = false;
    this.snap = false;
    this.snapSize = 16;

    channel.bind(this, 'Handler:connect', this.connect);
    this.addEventListener('mousedown', this.mousedown);
  }

  connect(object) {
    this.object = object;
    this.show(true);

    this.node.style.left = object.x + 'px';
    this.node.style.top = object.y + 'px';
    this.node.style.width = object.width + 'px';
    this.node.style.height = object.height + 'px';
  }

  show(isShow) {
    if (isShow) {
      this.node.style.visibility = 'visible';
    } else {
      this.node.style.visibility = 'hidden';
    }
  }

  updateTransform() {
    if (this.viewport == null) return;

    let dots = this.node.getElementsByClassName('vs-dot');
    for(var i = 0; i < dots.length; i++) {
      let type = dots[i].innerHTML;
      dots[i].style.transform = dotPreset[type] + ' scale(' + (1 / this.viewport.scale) + ')';
    }
  }

  mousemove(event) {
    if (this.object == null) return;

    event.stopPropagation();
    event.preventDefault();

    if (this.transform != null) {
      if (this.object.node.classList.contains('vs-transforming') === false) {
        this.object.node.classList.add('vs-transforming');
      }
      if (this.node.classList.contains('vs-hidechildren') === false) {
        this.node.classList.add('vs-hidechildren');
      }

      let dx = (event.clientX - this.dragStart.x) / this.viewport.scale;
      let dy = (event.clientY - this.dragStart.y) / this.viewport.scale;

      let x = 0;
      let y = 0;
      let w = 0;
      let h = 0;

      switch(this.transform) {
        case 'move': x = dx; y = dy; break;
        case 'e': w = dx; break;
        case 'se': w = dx; h = dy; break;
        case 's': h = dy; break;
        case 'sw': x = dx; w = -dx; h = dy; break;
        case 'w': x = dx; w = -dx; break;
        case 'nw': x = dx; w = -dx; y = dy; h = -dy; break;
        case 'n': y = dy; h = -dy; break;
        case 'ne': w = dx; y = dy; h = -dy; break;
      }

      if (event.shiftKey) {
        if (Math.abs(w) / (this.baseSize.width / this.baseSize.height) > Math.abs(h)) {
          h = w * (this.baseSize.height / this.baseSize.width);
        } else {
          w = h * (this.baseSize.width / this.baseSize.height);
        }
      }

      if (event.altKey) {
        x -= w;
        w *= 2;
        y -= h;
        h *= 2;
      }

      let _x = x;
      let _y = y;
      let _w = w;
      let _h = h;

      x += this.basePos.x;
      y += this.basePos.y;
      w += this.baseSize.width;
      h += this.baseSize.height;

      if (this.snap) {
        if (_x != 0) {
          x = parseInt(x / this.snapSize) * this.snapSize;
        }
        if (_y != 0) {
          y = parseInt(y / this.snapSize) * this.snapSize;
        }
        if (_w != 0) {
          w = parseInt(w / this.snapSize) * this.snapSize;
        }
        if (_h != 0) {
          h = parseInt(h / this.snapSize) * this.snapSize;
        }
      }

      w = Math.max(w, minSize);
      h = Math.max(h, minSize);

      this.node.style.left = x + 'px';
      this.node.style.top = y + 'px';
      this.node.style.width = w + 'px';
      this.node.style.height = h + 'px';

      this.object.x = parseInt(x);
      this.object.y = parseInt(y);
      this.object.width = parseInt(w);
      this.object.height = parseInt(h);
    }
  }

  mouseup(event) {
    if (this.object == null) return;
    event.stopPropagation();

    if (this.transform != null) {
      this.node.classList.remove('vs-hidechildren');
      this.object.node.classList.remove('vs-transforming');
      this.transform = null;
    }
    
    if (this.currentDot != null) {
      this.currentDot.classList.remove('vs-showme');
      this.currentDot = null;
    }

    this.removeEventListener('mousemove', window);
    this.removeEventListener('mouseup', window);

    this.handling = false;
  }

  mousedown(event) {
    if (this.object == null) return;

    this.dragStart = {
      x: event.clientX,
      y: event.clientY,
    };
    this.basePos = {
      x: this.object.x,
      y: this.object.y,
    };
    this.baseSize = {
      width: this.object.width,
      height: this.object.height,
    };

    if (event.target.classList.contains('vs-dot')) {
      this.transform = event.target.innerText;
      this.currentDot = event.target;
      this.currentDot.classList.add('vs-showme');
      event.stopPropagation();
    } else {
      this.transform = 'move';
    }
    this.addEventListener('mousemove', this.mousemove, window);
    this.addEventListener('mouseup', this.mouseup, window);

    this.handling = true;
  }

  render() {
    super.render();

    // Add 8 handler dots
    Object.getOwnPropertyNames(dotPreset).forEach(key => {
      let dot = document.createElement('div');
      dot.className = 'vs-dot ' + key;
      dot.innerText = key;
      this.node.appendChild(dot);
    });

    // To be ignored
    this.node.setAttribute('data-html2canvas-ignore', 'true');
    return this.node;
  }
}

export default Handler
