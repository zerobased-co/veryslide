import List from '../core/List';
import channel from '../core/Channel';

class Window {
  construct(parent) {
    this.parent = parent;
    this.node = null;
  }

  destruct() {
    this.node.parentNode.removeChild(this.node);
  }

  render() {
    this.node = document.createElement('div');
    return this.node;
  }
}

class PageList extends Window {
  constructor(...args) {
    super(...args);
    this.pagethumbs = new List();
    channel.bind(this, 'PageList:addPage', this.addPage);
    channel.bind(this, 'PageList:selectPage', this.selectPage);
    channel.bind(this, 'PageList:removePage', this.removePage);
  }

  addPage(pageInfo) {
    let pagethumb = this.pagethumbs.spawn(PageThumb);
    pagethumb.pageInfo = pageInfo;
    this.pagethumbs.append(pagethumb);

    this.node.append(pagethumb.render());
    pagethumb.node.scrollIntoView();
    pagethumb.select();
  }

  selectPage(pageInfo) {
    let pagethumb = this.pagethumbs.findby((item) => {
      return item.pageInfo.order == pageInfo.order;
    });

    if (pagethumb !== null) {
      pagethumb.select();
    }
  }

  removePage(pageInfo) {
    let pagethumb = this.pagethumbs.findby((item) => {
      return item.pageInfo.order == pageInfo.order;
    });

    if (pagethumb !== null) {
      let nextthumb = this.pagethumbs.remove(pagethumb);
      pagethumb.destruct();
    }
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-pagelist';
    return this.node;
  }
}

class Button extends Window {
  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-button';
    this.node.innerHTML = this.title;
    this.node.addEventListener('click', this.click);
    return this.node;
  }

  setTitle(text) {
    this.node.innerHTML = text;
  }

  click() {
    console.log('click');
  }
}

class Menu extends Window {
  constructor(...args) {
    super(...args);

    this.btnAddPage = new Button(this);
    this.btnAddPage.title = 'Add a page';
    this.btnAddPage.click = event => {
      channel.send('Document:addPage', null);
    };

    this.btnRemovePage = new Button(this);
    this.btnRemovePage.title = 'Remove page';
    this.btnRemovePage.click = event => {
      channel.send('Document:removePage', null);
    };

    this.btnZoom = new Button(this);
    this.btnZoom.title = 'Reset zoom';
    this.btnZoom.click = event => {
      channel.send('Viewport:zoom', 1.0);
      channel.send('Viewport:move', [0, 0]);
    };

    this.btnSnap = new Button(this);
    this.btnSnap.title = 'Snap Off';
    this.btnSnap.click = this.toggleSnap.bind(this);
    channel.bind(this, 'Menu:toggleSnap', this.toggleSnap);

    this.btnAddTextBox = new Button(this);
    this.btnAddTextBox.title = 'Add a text';
    this.btnAddTextBox.click = event => {
      channel.send('Document:addObject', 'TextBox');
    };

    this.btnRemoveObject = new Button(this);
    this.btnRemoveObject.title = 'Remove object';
    this.btnRemoveObject.click = event => {
      channel.send('Document:removeObject', null);
    };
  }

  toggleSnap() {
    let snap = channel.send('Viewport:toggleSnap', null)[0];
    if (snap) {
      this.btnSnap.setTitle('Snap On');
    } else {
      this.btnSnap.setTitle('Snap Off');
    }
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-menu';

    this.node.appendChild(this.btnAddPage.render());
    this.node.appendChild(this.btnRemovePage.render());
    this.node.appendChild(this.btnZoom.render());
    this.node.appendChild(this.btnSnap.render());
    this.node.appendChild(this.btnAddTextBox.render());
    this.node.appendChild(this.btnRemoveObject.render());
    return this.node;
  }
}

class PageThumb extends Window {
  constructor(...args) {
    super(...args);
    this.pageInfo = null;

    channel.bind(this, 'PageThumb:deselect', value => {
      this.deselect();
    });
  }

  select() {
    channel.send('PageThumb:deselect', null);
    this.node.classList.toggle('focus');
    channel.send('Viewport:selectPage', this.pageInfo);
  }

  deselect() {
    this.node.classList.remove('focus');
  }

  destruct() {
    super.destruct();
    channel.unbind(this);
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-pagethumb';
    this.node.addEventListener('click', event => {
      this.select();
    });
    return this.node;
  }
}

class Navigator extends Window {
  constructor(...args) {
    super(...args);
    this.pagelist = new PageList(this);
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-navigator';

    this.node.appendChild(this.pagelist.render());
    return this.node;
  }
}

class Page extends Window {
  constructor(...args) {
    super(...args);
    this.page = null;
  }

  setup(page) {
    this.page = page;
  }

  findObject(x, y) {
    for(var i = this.page.objects.array.length - 1; i >= 0; i--) {
      let object = this.page.objects.array[i];
      if (object.contain(x, y) === true) {
        return object;
      }
    }
    return null;
  }

  render() {
    this.node = this.page.render();
    //this.node.innerHTML = this.page.order;
    return this.node;
  }
}

class Handler extends Window {
  constructor(...args) {
    super(...args);
    this.object = null;
    this.transform = null;
    this.dragStart = undefined;
    this.basePos = undefined;
    this.baseSize = undefined;
    this.currentDot = null;
    this.snap = false;
    this.snapSize = 16;
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

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-handler';
    this.node.innerHTML = ''
      + '<div class="vs-dot vs-dot-nw">nw</div>'
      + '<div class="vs-dot vs-dot-n">n</div>'
      + '<div class="vs-dot vs-dot-ne">ne</div>'
      + '<div class="vs-dot vs-dot-e">e</div>'
      + '<div class="vs-dot vs-dot-se">se</div>'
      + '<div class="vs-dot vs-dot-s">s</div>'
      + '<div class="vs-dot vs-dot-sw">sw</div>'
      + '<div class="vs-dot vs-dot-w">w</div>';

    var mousemove = function(event) {
      if (this.object == null) return;
      event.stopPropagation();

      if (this.transform != null) {
        if (this.object.node.classList.contains('vs-transforming') === false) {
          this.object.node.classList.add('vs-transforming');
        }
        if (this.node.classList.contains('vs-hidechildren') === false) {
          this.node.classList.add('vs-hidechildren');
        }

        let dx = event.clientX - this.dragStart.x;
        let dy = event.clientY - this.dragStart.y;

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

        this.node.style.left = x + 'px';
        this.node.style.top = y + 'px';
        this.object.node.style.left = x + 'px';
        this.object.node.style.top = y + 'px';

        this.node.style.width = w + 'px';
        this.node.style.height = h + 'px';
        this.object.node.style.width = w + 'px';
        this.object.node.style.height = h + 'px';

        this.object.x = x;
        this.object.y = y;
        this.object.width = w;
        this.object.height = h;
      }
    };

    var mouseup = function(event) {
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

      window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseup', mouseup);
    };

    this.node.addEventListener('mousedown', event => {
      if (this.object == null) return;
      event.stopPropagation();

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

      window.addEventListener('mousemove', mousemove.bind(this));
      window.addEventListener('mouseup', mouseup.bind(this));
    });

    return this.node;
  }
}

class Viewport extends Window {
  constructor(...args) {
    super(...args);
    this.page = null;
    this.object = null;

    this.scrollX = 0;
    this.scrollY = 0;
    this.snap = false;
    this.grab = false;
    this.drag = false;
    this.dragStart = undefined;
    this.translate = {x: 0, y: 0};
    this.scale = 1.0;
    //this.zoomLevel = [10, 25, 50, 75, 100, 200, 400];
    this.handler = null;

    channel.bind(this, 'Viewport:selectPage', this.selectPage);
    channel.bind(this, 'Viewport:clear', this.clear);
    channel.bind(this, 'Viewport:move', this.move);
    channel.bind(this, 'Viewport:zoom', this.zoom);
    channel.bind(this, 'Viewport:addObject', this.addObject);
    channel.bind(this, 'Viewport:focus', this.focus);
    channel.bind(this, 'Viewport:blur', this.blur);
    channel.bind(this, 'Viewport:toggleSnap', this.toggleSnap);
  }

  clear() {
    if (this.page == null) return;

    this.blur();
    this.node.removeChild(this.page.node);
    delete this.page;
    this.page = null;
  }

  selectPage(page) {
    this.clear();
    this.page = new Page(this);
    this.page.setup(page);
    this.node.append(this.page.render());
    this.update();
    channel.send('Document:selectPage', page);
  }

  addObject(object) {
    this.page.node.append(object.render());
  }

  removeFocusedObject() {
    if (this.object == null) return;
    channel.send('Document:removeObject', this.object);
  }

  toggleSnap() {
    this.snap = !this.snap;
    this.handler.snap = this.snap;

    if (this.page) {
      if (this.snap) {
        this.page.node.classList.add('snap');
      } else {
        this.page.node.classList.remove('snap');
      }
    }
    return this.snap;
  }

  update() {
    if (this.page == null) return;
    this.page.node.style.transform = 'translate(' + this.translate.x + 'px, ' + this.translate.y + 'px) scale(' + this.scale + ')';
    this.handler.node.style.transform = 'translate(' + this.translate.x + 'px, ' + this.translate.y + 'px)';
  }

  focus(object) {
    this.object = object;
    this.handler.connect(object);
    channel.send('Document:selectObject', this.object);
  }

  blur() {
    this.object = null;
    this.handler.show(false);
    channel.send('Document:selectObject', null);
  }

  move(args) {
    this.translate = {
      x: args[0],
      y: args[1],
    };
    this.update();
  }

  zoom(scale) {
    this.scale = scale;
    console.log('zoom', scale);
    this.update();
  }

  zoomOut() {
    this.scale = this.scale - 0.1;
    console.log('zoom out', this.scale);
    this.update();
  }

  zoomIn() {
    this.scale = this.scale + 0.1;
    console.log('zoom in', this.scale);
    this.update();
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-viewport';
    this.node.tabIndex = '0';

    window.addEventListener('keydown', event => {
      if (event.keyCode === 32) {
        event.preventDefault();
        if (this.grab === false) {
          this.node.style.cursor = 'grab';
          this.grab = true;
          this.blur();
        }
      }

      if (event.keyCode === 189) {
        this.zoomOut();
      }

      if (event.keyCode === 187) {
        this.zoomIn();
      }

      if (event.keyCode === 83) {
        channel.send('Menu:toggleSnap', null);
      }

      if (event.keyCode === 46 || event.keyCode === 8) {
        this.removeFocusedObject();
      }
    });

    this.node.addEventListener('keyup', event => {
      if (event.keyCode === 32) {
        event.preventDefault();
        this.node.style.cursor = 'default';
        this.grab = false;
      }
    });

    this.node.addEventListener('mousemove', event => {
      if (this.page == null) return;
      if (this.drag === true) {
        let dx = event.clientX - this.dragStart.x;
        let dy = event.clientY - this.dragStart.y;

        this.translate.x = dx;
        this.translate.y = dy;
        this.update();
      }
    });

    this.node.addEventListener('mousedown', event => {
      if (this.page == null) return;
      if (this.grab === true) {
        this.node.style.cursor = 'grabbing';
        this.drag = true;
        this.dragStart = {
          x: event.clientX - this.translate.x,
          y: event.clientY - this.translate.y,
        }
      } else {
        let x = event.clientX - this.translate.x - this.node.offsetLeft;
        let y = event.clientY - this.translate.y - this.node.offsetTop;
        let pickedObject = this.page.findObject(x, y);
        if (pickedObject != null) {
          this.focus(pickedObject);
        } else {
          this.blur();
        }
      }
    });

    this.node.addEventListener('mouseup', event => {
      if (this.grab === true) {
        this.node.style.cursor = 'grab';
        this.drag = false;
      }
    });

    this.node.addEventListener('mouseleave', event => {
      this.node.style.cursor = 'default';
      this.grab = false;
      this.drag = false;
    });

    this.handler = new Handler();
    this.node.appendChild(this.handler.render());

    return this.node;
  }
}

class Property extends Window {
  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-box';
    this.node.innerHTML = ''
      + '<div class="vs-titlebar">Property</div>'
      + '<div class="vs-panel"></div>';
    return this.node;
  }
}

class ToolBox extends Window {
  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-toolbox';
    return this.node;
  }
}

class Row extends Window {
  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-row';
    return this.node;
  }
}

class Editor {
  constructor() {
    this.menu = new Menu(this);
    this.navigator = new Navigator(this);
    this.viewport = new Viewport(this);

    this.toolbox = new ToolBox(this);
    this.property = new Property(this);
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-editor';
    this.node.appendChild(this.menu.render());

    let row = new Row(this);
    this.node.appendChild(row.render());

    row.node.appendChild(this.navigator.render());
    row.node.appendChild(this.viewport.render());
    row.node.appendChild(this.toolbox.render());

    this.toolbox.node.appendChild(this.property.render());

    return this.node;
  }
}

export default Editor
