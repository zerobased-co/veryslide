import global from '/core/Global';
import View from './ui/View'
    
// Clockwise, from northwest
const dotPreset = [
//          x   y   w   h
  {'value': [+1, +1, -1, -1], 'transform': 'translate(-50%, -50%)', }, // North-west
  {'value': [ 0, +1,  0, -1], 'transform': 'translate(-50%, -50%)', }, // North
  {'value': [ 0, +1, +1, -1], 'transform': 'translate(+50%, -50%)', }, // North-east
  {'value': [ 0,  0, +1,  0], 'transform': 'translate(+50%, -50%)', }, // East
  {'value': [ 0,  0, +1, +1], 'transform': 'translate(+50%, +50%)', }, // South-east
  {'value': [ 0,  0,  0, +1], 'transform': 'translate(-50%, +50%)', }, // South
  {'value': [+1,  0, -1, +1], 'transform': 'translate(-50%, +50%)', }, // South-west
  {'value': [+1,  0, -1,  0], 'transform': 'translate(-50%, -50%)', }, // West
];

class Handler extends View {
  constructor(state) {
    super({
      className: 'vs-handler',
      object: null,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      order: 0,
      ...state,
    });

    this.viewport = this.send('Viewport:get')[0];
    this.transform = null;
    this.dragStart = undefined;
    this.basePos = undefined;
    this.baseSize = undefined;
    this.currentDot = null;

    this.addEventListener('mousedown', this.mousedown);
    this.listen('Object:updateTransform', () => this.updateTransform());
    this.listen('Object:moveTogether', this.moveTogether.bind(this));
    this.listen('Object:hideHandler', this.hideHandler.bind(this));

    if (this.object) {
      this.object.page.node.appendChild(this.node);
      this.object.addPairing(this);
      this.alignToObject(this.object);
      this.updateTransform();

      if (typeof this.object['is_overflow'] === 'function') {
        // TBD: Show overflow dot
      }
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

  hideHandler(from, hiding) {
    if (this === from) return;
    this.hide(hiding);
  }

  moveTogether(from, dx, dy) {
    if (this === from) return;
    this.object.x += dx;
    this.object.y += dy;
  }

  alignToObject(object) {
    this.x = object.x;
    this.y = object.y;
    this.width = object.width;
    this.height = object.height;
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
      let type = dots[i].dataset.type;
      dots[i].style.transform = dotPreset[type]['transform'] + ' scale(' + (1 / this.viewport.scale) + ')';
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
        this.hide(true);
      }

      let ratio = this.baseSize.width / this.baseSize.height;
      let dx = (event.clientX - this.dragStart.x) / this.viewport.scale;
      let dy = (event.clientY - this.dragStart.y) / this.viewport.scale;

      let x = 0;
      let y = 0;
      let w = 0;
      let h = 0;

      switch(this.transform) {
        case 'move':
          break;
      }

      if (this.transform === 'move') {
        if (event.shiftKey) {
          // Bound to 45 degree
          if (Math.min(Math.abs(dx), Math.abs(dy)) / Math.max(Math.abs(dx), Math.abs(dy)) > 0.82) {
            if (Math.abs(dx) > Math.abs(dy)) {
              dy = Math.sign(dy) * Math.abs(dx);
            } else {
              dx = Math.sign(dx) * Math.abs(dy);
            }
          } else {
            if (Math.abs(dx) > Math.abs(dy)) {
              dy = 0;
            } else {
              dx = 0;
            }
          }
        }
        x += dx;
        y += dy;
      } else {
        let dot = parseInt(this.transform);
        let v = dotPreset[dot]['value'].slice(0);

        if (event.altKey) {
          const vdot = (dot + 4) % 8;
          for(let i = 0; i < 4; i++) {
            v[i] -= dotPreset[vdot]['value'][i];
          }
        }

        if (event.shiftKey) {
          if (v[2] === 0) {
            v[0] = -v[3] * 0.5;
            v[2] = v[3];
          } else if (v[3] === 0) {
            v[1] = -v[2] * 0.5;
            v[3] = v[2];
          }

          if (Math.abs(dx) > Math.abs(dy)) {
            dy = dx / ratio * Math.sign(v[2]) * Math.sign(v[3]);
          } else {
            dx = dy * ratio * Math.sign(v[2]) * Math.sign(v[3]);
          }
        }

        x += v[0] * dx;
        y += v[1] * dy;
        w += v[2] * dx;
        h += v[3] * dy; 
      }

      let _x = x;
      let _y = y;
      let _w = w;
      let _h = h;

      x += this.basePos.x;
      y += this.basePos.y;
      w += this.baseSize.width;
      h += this.baseSize.height;

      if (global.snap) {
        if (_x != 0) {
          x = parseInt(x / global.snapSize) * global.snapSize;
        }
        if (_y != 0) {
          y = parseInt(y / global.snapSize) * global.snapSize;
        }
        if (_w != 0) {
          w = parseInt(w / global.snapSize) * global.snapSize;
        }
        if (_h != 0) {
          h = parseInt(h / global.snapSize) * global.snapSize;
        }
      }

      x = parseInt(x);
      y = parseInt(y);
      w = parseInt(w);
      h = parseInt(h);

      // Reversed
      if (w < 0) { x += w; w = -w; }
      if (h < 0) { y += h; h = -h; }

      if (this.transform === 'move') {
        if ((x - this.object.x) !== 0 || (y - this.object.y) !== 0) {
          this.send('Object:moveTogether', this, x - this.object.x, y - this.object.y);
        }
      }

      this.object.x = x;
      this.object.y = y;
      this.object.width = w;
      this.object.height = h;
    }
  }

  hide(hiding) {
    if (hiding !== false) {
      this.node.classList.add('vs-hidechildren');
    } else {
      this.node.classList.remove('vs-hidechildren');
    }
  }

  mouseup(event) {
    if (this.object == null) return;
    event.stopPropagation();
    event.preventDefault();

    if (this.transform != null) {
      this.hide(false);
      this.object.node.classList.remove('vs-transforming');
      this.send('Object:hideHandler', this, false);
      this.transform = null;
    }
    
    if (this.currentDot != null) {
      this.currentDot.classList.remove('vs-showme');
      this.currentDot = null;
    }

    this.removeEventListener('mousemove', document);
    this.removeEventListener('mouseup', document);
  }

  mousedown(event, fromEditor) {
    if (this.object == null) return;
    if (global.grabbing == true) return;

    event.stopPropagation();
    event.preventDefault();

    if (event.shiftKey && !fromEditor) {
      this.send('Controller:deselect', this.object);
      return;
    }

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
      this.transform = event.target.dataset.type;
      this.currentDot = event.target;
      this.currentDot.classList.add('vs-showme');
    } else {
      if (event.detail >= 2) {
        if (this.object.editable != null) {
          this.send('Controller:deselect');
          this.object.editable();
          this.transform = null;
        }
      } else {
        this.transform = 'move';
      }
    }

    this.send('Object:hideHandler', this, true);
    
    if (this.transform != null) {
      this.addEventListener('mousemove', this.mousemove, document);
      this.addEventListener('mouseup', this.mouseup, document);
    }
  }

  render() {
    super.render();

    // Add 8 handler dots
    for(let i = 0; i < dotPreset.length; i++) {
      let dot = document.createElement('div');
      dot.className = 'vs-dot d' + i;
      dot.dataset.type = i;
      this.node.appendChild(dot);
    }

    // To be ignored
    this.node.setAttribute('data-render-ignore', 'true');
    return this.node;
  }
}

export default Handler
