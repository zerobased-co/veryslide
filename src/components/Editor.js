import './Editor.scss';
import global from '/core/Global';
import A from '/core/Array';
import ui from './ui/UI';
import View from './ui/View';
import Panel from './ui/Panel';
import Dialog from './ui/Dialog';
import PageList from './PageList';
import AssetList from './AssetList';
import Property from './Property';
import Handler from './Handler';


class ExportDialog extends Dialog {
  constructor(state) {
    super({
      pages: 'current',
      type: 'png',
      scale: 1,
      customPage: '',
      doc: null,
      ...state,
    });

    [
      new ui.TitleBar({'title': 'Export'}),
      ui.H(
        ui.createText('Pages'),
        new ui.Select({
          options: [
            ['current', 'Current page'],
            // TBD
            //['all', 'All pages'],
            //['custom', 'Custom'],
          ],
        }).pair(this, 'pages'),
        /*
        new ui.InputText({
          'placeholder': 'e.g. 1-4, 2, 10-',
          'className': 'vs-inputtext-140',
        }).pair(this, 'customPage'),
        */
      ),
      ui.H(
        ui.createText('Scale'),
        new ui.InputText().pair(this, 'scale'),
      ),
      ui.H(
        ui.createText('Type'),
        ui.V(
          ui.H(
            new ui.Select({
              options: [
                ['png', 'PNG'],
                ['pdf', 'PDF'],
              ],
            }).pair(this, 'type'),
          ),
        ),
      ),
      new ui.Separator(),
      ui.HE(
        ui.createButton('Export', () => {
          // ‘from and to’ use 1-based index(human-friendly), not zero-based.
          let from = 1;
          let to = this.doc.pages.length;

          if (this.pages == 'current') {
            from = to = this.doc.focusedPageIndex + 1;
          }

          this.close();
          this.send('Controller:exportPage', this.type, this.scale, from, to);
        }),
        ui.createButton('Close', () => { this.close(); }),
      ),
    ].forEach(item => this.appendChild(item));
  }
}


class Menu extends View {
  constructor(state) {
    super({
      className: 'vs-menu',
      ...state,
    });

    [
      new ui.Text({'title': 'Page'}),
      ui.createButton('Add',    () => { this.send('Controller:addPage'); }),

      ui.HGroup(
        this.btnUndo = ui.createButton('Undo', () => this.send('Controller:history', 'Undo')),
        this.btnRedo = ui.createButton('Redo', () => this.send('Controller:history', 'Redo')),
      ),

      ui.HGroup(
        ui.createButton('Reset zoom', () => { this.resetZoom(); }),
        this.btnSnap = ui.createButton('Snap Off', () => { this.toggleSnap(); }),
      ),

      new ui.Text({'title': 'Object'}),
      ui.HGroup(
        ui.createButton('TextBox',   () => { this.send('Controller:addObject', 'TextBox'); }),
        ui.createButton('Image',     () => { this.openFileDialog(); }),
        ui.createButton('ImageList', () => { this.send('Controller:addObject', 'ImageList'); }),
      ),

      new ui.Text({'title': 'Misc'}),
      ui.HGroup(
        ui.createButton('Export', () => { this.send('Editor:export'); }),
        ui.createButton('Save',  () => { this.send('Veryslide:save'); }),
        ui.createButton('Play',  () => { this.send('Viewport:setPresentationMode', true); }),
      ),

      ui.createButton('Close',   () => {
        window.history.back();
      }),
    ].forEach(item => this.appendChild(item));


    this.listen('Menu:resetZoom', this.resetZoom);
    this.listen('Menu:toggleSnap', this.toggleSnap);
    this.listen('Menu:historyChanged', this.historyChanged);

    this.btnUndo.enable(false);
    this.btnRedo.enable(false);
  }

  historyChanged(undoable, redoable) {
    this.btnUndo.enable(undoable);
    this.btnRedo.enable(redoable);
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
          this.send('Controller:addObject', 'ImageBox', null, {
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
      viewport: null,
      preSelectedList: [],
      selectedList: [],
      ...state,
    });
  }

  reset() {
    this.preSelectedList = [];
    this.selectedList = [];
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

    if (this.viewport.page != null) {
      let cx = (x - this.viewport.translate.x) / this.viewport.scale;
      let cy = (y - this.viewport.translate.y) / this.viewport.scale;
      let cw = w / this.viewport.scale;
      let ch = h / this.viewport.scale;

      if (this.box != null) {
        this.box.remove();
      }

      let boundObjects = this.viewport.page.findObjects(cx, cy, cw, ch);
      let deselectList = A.clone(this.selectedList);

      boundObjects.forEach((object) => {
        if (this.selectedList.indexOf(object) == -1) {
          if (this.preSelectedList.indexOf(object) !== -1 && (event.shiftKey || event.metaKey)) {
            this.send('Controller:deselect', object);
            this.selectedList.push(object);
          } else {
            this.send('Controller:select', object, true);
            this.selectedList.push(object);
          }
        }
        A.remove(deselectList, object);
      });

      deselectList.forEach((object) => {
        if (this.preSelectedList.indexOf(object) !== -1 && (event.shiftKey || event.metaKey)) {
          this.send('Controller:select', object, true);
          A.remove(this.selectedList, object);
        } else {
          this.send('Controller:deselect', object);
          A.remove(this.selectedList, object);
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

    this.mode = 'normal'; // normal, scroll, select
    this.dragStart = undefined;
    this.translate = {x: 0, y: 0};
    this.lastTranslate = {x: 0, y: 0};
    this.scale = 1.0;
    //this.zoomLevel = [10, 25, 50, 75, 100, 200, 400];
    this.isPresentationMode = false;

    this.listen('Viewport:get', () => { return this });
    this.listen('Viewport:focusPage', this.focusPage);
    this.listen('Viewport:clear', this.clear);
    this.listen('Viewport:move', this.move);
    this.listen('Viewport:zoom', this.zoom);
    this.listen('Viewport:toggleSnap', this.toggleSnap);
    this.listen('Viewport:setPresentationMode', this.setPresentationMode);

    this.interval = setInterval(this.updateThumbnail.bind(this), 2000);
    this.keydownEvents = [
    // shift, ctrl,  alt,   meta,  keycodes, func
      [false, false, false, false, [32], () => this.beginGrab()],
      [false, false, false, false, [173, 189], () => this.zoomOut()],
      [false, false, false, false, [61, 187], () => this.zoomIn()],
      [false, false, false, false, [83], () => this.send('Menu:toggleSnap', null)],
      [false, false, false, false, [48], () => this.send('Menu:resetZoom', null)],
      [false, false, false, false, [46, 8], () => this.send('Controller:remove')],
      [false, false, false, false, [219], () => this.send('Controller:order', 'backward')],
      [false, false, false, false, [221], () => this.send('Controller:order', 'forward')],
      [false, false, false, true,  [66], () => this.send('Controller:style', 'Bold')],
      [false, false, false, true,  [73], () => this.send('Controller:style', 'Italic')],
      [false, false, false, true,  [85], () => this.send('Controller:style', 'Underline')],
      [false, false, false, true,  [173, 189], () => this.send('Controller:style', 'Smaller')],
      [false, false, false, true,  [61, 187], () => this.send('Controller:style', 'Bigger')],
      [false, false, false, true,  [83], () => this.send('Veryslide:save')],
      [false, false, false, false, [27], () => this.setPresentationMode(false)],
      [false, false, false, false, [37], () => this.send('Controller:move', 'Left')],
      [false, false, false, false, [38], () => this.send('Controller:move', 'Up')],
      [false, false, false, false, [39], () => this.send('Controller:move', 'Right')],
      [false, false, false, false, [40], () => this.send('Controller:move', 'Down')],
      [true,  false, false, false, [37], () => this.send('Controller:move', 'BigLeft')],
      [true,  false, false, false, [38], () => this.send('Controller:move', 'BigUp')],
      [true,  false, false, false, [39], () => this.send('Controller:move', 'BigRight')],
      [true,  false, false, false, [40], () => this.send('Controller:move', 'BigDown')],
      [false, false, true,  false, [78], () => this.send('Controller:addPage')],
      [false, false, false, true,  [89], () => this.send('Controller:history', 'Redo')],
      [true,  false, false, true,  [90], () => this.send('Controller:history', 'Redo')],
      [false, false, false, true,  [90], () => this.send('Controller:history', 'Undo')],
      [false, false, true,  true,  [67], () => this.send('Controller:copyStyle')],
      [false, false, true,  true,  [86], () => this.send('Controller:pasteStyle')],
      [false, false, false, true,  [65], () => this.send('Controller:selectAll')],
      [false, false, false, true,  [68], () => this.send('Controller:deselect')],
    ];
    this.keyupEvents = [
    // shift, ctrl,  alt,   meta,  keycodes, func
      [false, false, false, false, [32], () => this.resetMode()],
    ];

    ['copy', 'paste', 'cut', 'keydown', 'keyup'].forEach(e => {
      this.addEventListener(e, this[e], window);
    }, this);

    this.addEventListener('mousedown', this.onMouseDown);
    this.addEventListener('resize', this.onResize, window);
    this.addEventListener('fullscreenchange', this.onFullscreenChange, document);
  }

  convertPoint(x, y) {
    return {x, y};
  }

  onMouseDown = (event) => {
    if (this.page == null) return;
    // TBD: do something different in presentation mode
    if (this.isPresentationMode) return;

    let rect = this.node.getBoundingClientRect();
    let x = event.clientX - rect.x;
    let y = event.clientY - rect.y;
    let handled = false;

    this.dragStart = {x, y};

    if (global.grabbing === true) {
      this.node.style.cursor = 'grabbing';
      this.mode = 'scroll';
      this.lastTranslate.x = this.translate.x;
      this.lastTranslate.y = this.translate.y;
      handled = true;
    } else {
      // TBD: mutiply matrix to x and y before finding
      let cx = x / this.scale - this.translate.x;
      let cy = y / this.scale - this.translate.y;
      let objects = this.page.findObjects(cx, cy);
      if (objects.length > 0) {
        const lastObject = objects.slice(-1)[0];

        // If selected object is in content-editing, let it as it is
        if (lastObject !== global.editingObject) {
          if (lastObject.selected === false) {
            this.send('Controller:select', lastObject, (event.shiftKey || event.metaKey));
            lastObject.handler.mousedown(event, true);
            handled = true;
          }
        }
      } else {
        if (!event.shiftKey && !event.metaKey) {
          this.send('Controller:deselect');
        }
        this.mode = 'select';
        this.setSelector(x, y);
        handled = true;
      }
    }

    if (handled) {
      event.preventDefault();
      this.addEventListener('mousemove', this.onMouseMove, document);
      this.addEventListener('mouseup', this.onMouseUp, document);

      if (global.editingObject) {
        global.editingObject.blur();
        global.editingObject = null;
      }
    }
  }

  onMouseUp = (event) => {
    this.removeEventListener('mousemove', document);
    this.removeEventListener('mouseup', document);
    this.resetMode();
  }

  onMouseMove = (event) => {
    event.preventDefault();

    if (this.page == null) return;
    if (this.mode == 'normal') return;

    let rect = this.node.getBoundingClientRect();
    let dx = event.clientX - rect.x - this.dragStart.x;
    let dy = event.clientY - rect.y - this.dragStart.y;

    if (Math.abs(dx) + Math.abs(dy) < 3) {
      return;
    }

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
    global.grabbing = false;

    this.node.style.cursor = 'default';
    this.mode = 'normal';
    this.selector.hide();
  }

  setSelector(x, y) {
    this.selector.x = x;
    this.selector.y = y;
    this.selector.reset();

    this.selector.preSelectedList = A.clone(this.send('Controller:getSelection')[0]);

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
    if (global.grabbing === false && this.mode === 'normal') {
      this.node.style.cursor = 'grab';
      global.grabbing = true;
    }
  }

  updateThumbnail() {
    // TBD: prevent updating while editing objects
    if (this.page == null) return;
    if (this.isPresentationMode) return;
    if (global.grabbing) return;
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
      if (global.snap) {
        this.page.node.appendChild(this.pageSnap);
      } else {
        this.pageSnap.remove();
      }
    }
  }

  toggleSnap(show = null) {
    if (show != null) {
      global.snap = show;
    } else {
      global.snap = !global.snap;
    }
    this.setPageSnap();
    return global.snap;
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
      this.send('Object:updateTransform');
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

  cut(event) {
    this.send('Controller:copy');
    this.send('Controller:remove');
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

    this.selector = new Selector({
      viewport: this,
    });
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

    this.listen('ToolBox:activeTab', this.activeTab);
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

    this.listen('Editor:export', () => {
      const dialog = new ExportDialog({doc: this.doc});
      this.appendChild(dialog);
      dialog.modal();
    });
  }

  init() {
    if (this.doc == null) {
      return;
    }

    if (this.doc.focusedPageIndex >= 0) {
      let page = this.doc.pages[this.doc.focusedPageIndex];
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
