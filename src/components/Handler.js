import View from './ui/View'
    
const minSize = 0;
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
      object: null,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      ...state,
    });

    this.viewport = this.send('Viewport:get')[0];
    this.transform = null;
    this.dragStart = undefined;
    this.basePos = undefined;
    this.baseSize = undefined;
    this.currentDot = null;
    this.snap = false;
    this.snapSize = 16;

    this.addEventListener('mousedown', this.mousedown);
    this.listen('Object:updateTransform', () => this.updateTransform());
    this.listen('Object:moveTogether', this.moveTogether.bind(this));

    if (this.object) {
      this.node.style.zIndex = this.object.node.zIndex;
      this.object.page.node.appendChild(this.node);
      this.object.addPairing(this);
      this.alignToObject(this.object);
      this.updateTransform();
    }
  }

  destroy() {
    super.destroy();
    if (this.object) {
      this.object.removePairing(this);
    }
  }

  notify(from, key, value) {
    if (from === this.object) {
      this[key] = value;
    }
  }

  moveTogether(from, dx, dy) {
    if (this === from) return;
    this.object.x += dx;
    this.object.y += dy;
  }

  alignToObject() {
    this.node.style.left = this.object.x + 'px';
    this.node.style.top = this.object.y + 'px';
    this.node.style.width = this.object.width + 'px';
    this.node.style.height = this.object.height + 'px';
  }

  on_x(x) {
    this.node.style.left = x + 'px';
  }

  on_y(y) {
    this.node.style.top = y + 'px';
  }

  on_width(width) {
    this.node.style.width = width + 'px';
  }

  on_height(height) {
    this.node.style.height = height + 'px';
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
        if (this.transform === 'move') {
          // Bound to 45 degree
          if (Math.min(Math.abs(x), Math.abs(y)) / Math.max(Math.abs(x), Math.abs(y)) > 0.82) {
            if (Math.abs(x) > Math.abs(y)) {
              y = Math.sign(y) * Math.abs(x);
            } else {
              x = Math.sign(x) * Math.abs(y);
            }
          } else {
            if (Math.abs(x) > Math.abs(y)) {
              y = 0;
            } else {
              x = 0;
            }
          }
        } else {
          // Preserving ratio
          if (Math.abs(w) / (this.baseSize.width / this.baseSize.height) > Math.abs(h)) {
            h = w * (this.baseSize.height / this.baseSize.width);
          } else {
            w = h * (this.baseSize.width / this.baseSize.height);
          }
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

      if (this.transform === 'move') {
        this.send('Object:moveTogether', this, parseInt(x) - this.object.x, parseInt(y) - this.object.y);
      }

      this.object.x = parseInt(x);
      this.object.y = parseInt(y);
      this.object.width = parseInt(w);
      this.object.height = parseInt(h);
    }
  }

  mouseup(event) {
    if (this.object == null) return;
    event.stopPropagation();
    event.preventDefault();

    if (this.transform != null) {
      this.node.classList.remove('vs-hidechildren');
      this.object.node.classList.remove('vs-transforming');
      this.transform = null;
    }
    
    if (this.currentDot != null) {
      this.currentDot.classList.remove('vs-showme');
      this.currentDot = null;
    }

    this.removeEventListener('mousemove', document);
    this.removeEventListener('mouseup', document);
  }

  mousedown(event) {
    if (this.object == null) return;
    event.stopPropagation();
    event.preventDefault();

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
    } else {
      this.transform = 'move';
    }
    this.addEventListener('mousemove', this.mousemove, document);
    this.addEventListener('mouseup', this.mouseup, document);
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
    this.node.setAttribute('data-render-ignore', 'true');
    return this.node;
  }
}

export default Handler
