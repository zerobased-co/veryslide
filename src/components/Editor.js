import './Editor.scss';
import List from '/core/List';
import ui from './ui/UI';
import View from './ui/View';
import Panel from './ui/Panel';
import PageList from './PageList';
import AssetList from './AssetList';
import Property from './Property';
import Handler from './Handler';


class Menu extends View {
  constructor(state) {
    super({
      className: 'vs-menu',
      ...state,
    });

    [
      new ui.Text({'title': 'Page'}),
      ui.createButton('Add',    () => { this.send('Controller:addPage'); }),

      new ui.Text({'title': 'Viewport'}),
      ui.HGroup(
        ui.createButton('Reset zoom',    () => { this.resetZoom(); }),
        ui.createButton('Snap Off',      () => { this.toggleSnap(); }),
      ),

      new ui.Text({'title': 'Object'}),
      ui.HGroup(
        ui.createButton('TextBox',   () => { this.send('Controller:addObject', 'TextBox'); }),
        ui.createButton('Image',     () => { this.openFileDialog(); }),
        ui.createButton('ImageList', () => { this.send('Controller:addObject', 'ImageList'); }),
      ),

      new ui.Text({'title': 'Misc'}),
      ui.HGroup(
        ui.createButton('Image', () => { this.send('Controller:savePage', 'image'); }),
        ui.createButton('All',   () => { this.send('Controller:saveAllPage', 'image'); }),
        ui.createButton('Save',   () => { this.send('Veryslide:save'); }),
        ui.createButton('Play',   () => { this.send('Viewport:setPresentationMode', true); }),
      ),

      ui.createButton('Close',   () => { 
        window.history.back();
      }),
    ].forEach(item => this.appendChild(item));


    this.listen(this, 'Menu:resetZoom', this.resetZoom);
    this.listen(this, 'Menu:toggleSnap', this.toggleSnap);
  }

  openFileDialog() {
    // create hidden file input
    var input = document.createElement('input');
    input.style.visibility = 'hidden';
    input.type = 'file';
    input.addEventListener('change', event => {
      var file = event.target.files[0];
      console.log(file);
      var reader = new FileReader();
      reader.addEventListener("load", () => {
        var image = new Image();
        image.src = reader.result;
        image.onload = () => {
          this.send('Controller:addObject', 'ImageBox', {
            width: image.width,
            height: image.height,
            src: image.src,
          }, file);
        }
      }, false);
      reader.readAsDataURL(file);
    });
    input.click();
  }

  resetZoom() {
    this.send('Viewport:zoom', 1.0);
    this.send('Viewport:move', [0, 0]);
  }

  toggleSnap() {
    let snap = this.send('Viewport:toggleSnap')[0];
    if (snap) {
      this.btnSnap.title = 'Snap On';
    } else {
      this.btnSnap.title = 'Snap Off';
    }
  }
}

class Navigator extends View {
  constructor(state) {
    super({
      className: 'vs-navigator',
      children: [new PageList()],
      ...state,
    });
  }
}

class Selector extends View {
  constructor(state) {
    super({
      className: 'vs-selector',
      x: 0,
      y: 0,
      page: null,
      preSelectedList: new List(),
      selectedList: new List(),
      ...state,
    });
  }

  reset() {
    this.page = null;
    this.preSelectedList = new List();
    this.selectedList = new List();
    this.resize(0, 0);
  }
  
  resize = (dx, dy, event) => {
    let x = this.x;
    let y = this.y;
    let w = dx;
    let h = dy;

    if (w < 0) { x += w; w *= -1; }
    if (h < 0) { y += h; h *= -1; }

    this.node.style.left = x + 'px';
    this.node.style.top = y + 'px';
    this.node.style.width = w + 'px';
    this.node.style.height = h + 'px';

    if (this.page != null) {
      let boundObjects = this.page.findObjects(x, y, w, h);
      let deselectList = this.selectedList.clone();

      boundObjects.forEach((object) => {
        if (this.selectedList.find(object) == -1) {
          if (this.preSelectedList.find(object) !== -1 && event.shiftKey == true) {
            this.send('Controller:deselect', object);
            this.selectedList.append(object);
          } else {
            this.send('Controller:select', object, true);
            this.selectedList.append(object);
          }
        }
        deselectList.remove(object);
      });

      deselectList.iter((object) => {
        if (this.preSelectedList.find(object) !== -1 && event.shiftKey == true) {
          this.send('Controller:select', object, true);
          this.selectedList.remove(object);
        } else {
          this.send('Controller:deselect', object);
          this.selectedList.remove(object);
        }
      });
    }
  }
}

class Viewport extends View {
  constructor(state) {
    super({
      className: 'vs-viewport',
      ...state,
    });

    this.page = null;
    this.object = null;

    this.snap = false;
    this.grab = false;
    this.mode = 'normal'; // normal, scroll, select
    this.dragStart = undefined;
    this.translate = {x: 0, y: 0};
    this.lastTranslate = {x: 0, y: 0};
    this.scale = 1.0;
    //this.zoomLevel = [10, 25, 50, 75, 100, 200, 400];
    this.isPresentationMode = false;

    this.listen(this, 'Viewport:focusPage', this.focusPage);
    this.listen(this, 'Viewport:clear', this.clear);
    this.listen(this, 'Viewport:move', this.move);
    this.listen(this, 'Viewport:zoom', this.zoom);
    this.listen(this, 'Viewport:toggleSnap', this.toggleSnap);
    this.listen(this, 'Viewport:setPresentationMode', this.setPresentationMode);

    this.interval = setInterval(this.updateThumbnail.bind(this), 2000);
    this.keydownEvents = [
    // shift, ctrl,  alt,   meta,  keycodes, func
      [false, false, false, false, [32], () => this.beginGrab()],
      [false, false, false, false, [173, 189], () => this.zoomOut()],
      [false, false, false, false, [61, 187], () => this.zoomIn()],
      [false, false, false, false, [83], () => this.send('Menu:toggleSnap', null)],
      [false, false, false, false, [48], () => this.send('Menu:resetZoom', null)],
      [false, false, false, false, [46, 8], () => this.send('Controller:remove')],
      [false, false, false, false, [219], () => this.send('Controller:order', this.object, 'backward')],
      [false, false, false, false, [221], () => this.send('Controller:order', this.object, 'forward')],
      [false, false, false, true,  [66], () => this.applyStyle('Bold')],
      [false, false, false, true,  [73], () => this.applyStyle('Italic')],
      [false, false, false, true,  [85], () => this.applyStyle('Underline')],
      [false, false, false, true,  [83], () => this.send('Veryslide:save')],
      [false, false, false, true,  [173, 189], () => this.applyStyle('Smaller')],
      [false, false, false, true,  [61, 187], () => this.applyStyle('Bigger')],
      [false, false, false, false, [27], () => this.setPresentationMode(false)],
      [false, false, false, false, [37], () => this.applyMove('Left')],
      [false, false, false, false, [38], () => this.applyMove('Up')],
      [false, false, false, false, [39], () => this.applyMove('Right')],
      [false, false, false, false, [40], () => this.applyMove('Down')],
      [true,  false, false, false, [37], () => this.applyMove('BigLeft')],
      [true,  false, false, false, [38], () => this.applyMove('BigUp')],
      [true,  false, false, false, [39], () => this.applyMove('BigRight')],
      [true,  false, false, false, [40], () => this.applyMove('BigDown')],
      [false, false, true, false,  [78], () => this.send('Controller:addPage')],
    ];
    this.keyupEvents = [
    // shift, ctrl,  alt,   meta,  keycodes, func
      [false, false, false, false, [32], () => this.resetMode()],
    ];

    ['copy', 'paste', 'keydown', 'keyup'].forEach(e => {
      this.addEventListener(e, this[e], window);
    }, this);

    this.addEventListener('mousedown', this.onMouseDown);
    this.addEventListener('resize', this.onResize, window);
    this.addEventListener('mousemove', this.onMouseMove, document);
    this.addEventListener('mouseup', this.onMouseUp, document);
    this.addEventListener('fullscreenchange', this.onFullscreenChange, document);
  }

  onMouseDown = (event) => {
    if (this.page == null) return;
    // TBD: do something different in presentation mode
    if (this.isPresentationMode) return;

    let rect = this.node.getBoundingClientRect();
    let x = event.clientX - rect.x;
    let y = event.clientY - rect.y;
    this.dragStart = {x, y};
    event.preventDefault();

    if (this.grab === true) {
      event.preventDefault();

      this.node.style.cursor = 'grabbing';
      this.mode = 'scroll';
      this.lastTranslate.x = this.translate.x;
      this.lastTranslate.y = this.translate.y;
    } else {
      // TBD: mutiply matrix to x and y before finding
      let objects = this.page.findObjects(x, y);
      if (objects.length > 0) {
        const lastObject = objects.slice(-1)[0];
        if (event.detail >= 2) {
          this.editable(lastObject);
        } else {
          this.send('Controller:select', lastObject, event.shiftKey);
        }
      } else {
        if (event.shiftKey === false) {
          this.send('Controller:deselect');
        }
        this.mode = 'select';
        this.setSelector(x, y);
      }
    }
  }

  onMouseUp = (event) => {
    this.resetMode();
  }

  onMouseMove = (event) => {
    event.preventDefault();

    if (this.page == null) return;
    if (this.mode == 'normal') return;

    let rect = this.node.getBoundingClientRect();
    let dx = event.clientX - rect.x - this.dragStart.x;
    let dy = event.clientY - rect.y - this.dragStart.y;

    switch(this.mode) {
      case 'scroll':
        this.translate.x = this.lastTranslate.x + dx;
        this.translate.y = this.lastTranslate.y + dy;
        this.updateTransform();
        break;
      case 'select':
        this.selector.resize(dx, dy, event);
        break;
    }
  }

  resetMode() {
    this.node.style.cursor = 'default';
    this.grab = false;
    this.mode = 'normal';
    this.selector.hide();
  }

  setSelector(x, y) {
    this.selector.reset();

    this.selector.x = x;
    this.selector.y = y;
    this.selector.page = this.page;
    this.selector.preSelectedList = this.send('Controller:getSelection')[0].clone();

    this.selector.show();
  }

  onResize = () => {
    if (this.isPresentationMode) {
      this.updateTransform();
    }
  }

  onFullscreenChange = () => {
    if (document.fullscreenElement == null) {
      this.setPresentationMode(false);
    }
  }

  beginGrab() {
    if (this.grab === false && this.mode === 'normal') {
      this.node.style.cursor = 'grab';
      this.grab = true;
    }
  }

  applyStyle(style) {
    if (this.object == null) return;
    if (typeof this.object['apply'] !== 'function') return;

    this.object.apply(style);
  }

  applyMove(direction) {
    if (this.isPresentationMode) {
      switch(direction) {
        case 'Left':
        case 'Up':
          this.send('Controller:prevPage');
          break;
        case 'Right':
        case 'Down':
          this.send('Controller:nextPage');
          break;
      }
    } else {
      if (this.object == null) {
        switch(direction) {
          case 'Up':
            this.send('Controller:prevPage');
            break;
          case 'Down':
            this.send('Controller:nextPage');
            break;
        }
      } else {
        if (typeof this.object['apply'] !== 'function') return;
        this.object.apply(direction);
      }
    }
  }

  updateThumbnail() {
    // TBD: prevent updating while editing objects
    if (this.page == null) return;
    if (this.isPresentationMode) return;
    if (this.grab || this.drag) return;
    this.page.updateThumbnail();
  }

  destroy() {
    super.destroy();
    clearInterval(this.interval);
  }

  clear() {
    if (this.page == null) return;

    this.pageHolder.removeChild(this.page.node);
    delete this.page;
    this.page = null;
  }

  focusPage(page) {
    this.clear();

    this.page = page;
    this.pageHolder.append(this.page.node);

    this.updateTransform();
    this.setPageSnap();
  }
  
  setPageSnap() {
    if (this.page) {
      if (this.snap) {
        this.page.node.appendChild(this.pageSnap);
      } else {
        this.pageSnap.remove();
      }
    }
  }

  toggleSnap(show = null) {
    if (show != null) {
      this.snap = show;
    } else {
      this.snap = !this.snap;
    }
    this.setPageSnap();
    return this.snap;
  }

  updateTransform() {
    if (this.isPresentationMode) {
      let width = window.innerWidth;
      let height = window.innerHeight;
      let top = 0;
      let left = 0;
      let scale = 1;
      
      if (this.page) {
        if ( width / this.page.width < height / this.page.height) {
          scale = width / this.page.width;
          top = (height - this.page.height * scale) / 2;
        } else {
          scale = height / this.page.height;
          left = (width - this.page.width * scale) / 2;
        }
        this.pageHolder.style.transform = 'translate(' + left + 'px, ' + top + 'px) scale(' + scale + ')';
      }
    } else {
      this.pageHolder.style.transform = 'translate(' + this.translate.x + 'px, ' + this.translate.y + 'px) scale(' + this.scale + ')';
    }
  }

  editable(object) {
    if (object.editable != null) {
      this.send('Controller:deselect');
      object.editable();
    }
  }

  move(args) {
    this.translate = {
      x: args[0],
      y: args[1],
    };
    this.updateTransform();
  }

  zoom(scale) {
    this.scale = scale;
    this.updateTransform();
  }

  zoomOut() {
    this.scale = this.scale - 0.1;
    this.updateTransform();
  }

  zoomIn() {
    this.scale = this.scale + 0.1;
    this.updateTransform();
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

  copy(event) {
    this.send('Controller:copy');
  }

  paste(event) {
    if (event.target !== document.body && event.target !== this.node) {
      return;
    }
    this.send('Controller:paste');
  }

  setPresentationMode(mode) {
    if (mode === this.isPresentationMode) {
      return;
    }
    this.isPresentationMode = mode;

    if (this.isPresentationMode) {
      this.toggleSnap(false);
      this.editor.node.classList.add('Presentation');
      this.node.requestFullscreen();
    } else {
      this.editor.node.classList.remove('Presentation');
      // TBD: this makes `Document not active` error occasionally, but I'm not sure how to prevent it.
      document.exitFullscreen().catch(() => {});;
      this.send('PageList:selectPage', this.page, false);
    }
    this.updateTransform();
  }

  render() {
    super.render();
    this.node.tabIndex = '0';
    this.pageHolder = document.createElement('div');
    this.pageHolder.className = 'vs-pageholder';
    this.appendChild(this.pageHolder);

    this.pageSnap = document.createElement('div');
    this.pageSnap.className = 'vs-pagesnap';
    this.pageSnap.setAttribute('data-render-ignore', 'true');

    this.selector = new Selector();
    this.selector.hide();
    this.appendChild(this.selector);

    return this.node;
  }
}

class ToolBox extends View {
  constructor(state) {
    super({
      className: 'vs-toolbox',
      ...state,
    });

    this.listen(this, 'ToolBox:activeTab', this.activeTab);
  }

  activeTab(name) {
    this.tabGroup.selectTab(name);
  }

  render() {
    super.render();
    this.tabGroup = new ui.TabGroup({tabs: [
      ['Property', new Property()],
      ['Asset', new AssetList()],
    ]});

    this.appendChild(this.tabGroup);
    return this.node;
  }
}

class Editor extends View {
  constructor(state) {
    super({
      className: 'vs-editor',
      doc: null,
      ...state,
    });
  }

  init() {
    if (this.doc == null) {
      return;
    }

    if (this.doc.focusedPageIndex >= 0) {
      let page = this.doc.pages.at(this.doc.focusedPageIndex);
      this.send('Controller:select', page);
    }
  }

  render() {
    super.render();
    this.appendChild(this.menu = new Menu());

    let row = new ui.Horizon();
    this.appendChild(row);

    row.appendChild(this.navigator = new Navigator());
    row.appendChild(this.viewport = new Viewport());
    row.appendChild(this.toolbox = new ToolBox());

    this.viewport.editor = this;

    return this.node;
  }
}

export default Editor
