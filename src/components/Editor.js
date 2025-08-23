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
      pages: 'all',
      type: 'pdf',
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
            ['all', 'All'],
            ['current', 'Current'],
            ['custom', 'Custom'],
          ],
        }).pair(this, 'pages'),
        new ui.InputText({
          'placeholder': 'e.g. 1-4, 2, 10-',
          'className': 'vs-inputtext-140',
        }).pair(this, 'customPage'),
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
                ['pdf', 'PDF'],
                ['png', 'PNG'],
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
          } else if (this.pages == 'custom') {
            const re = /(\d*)(-?)(\d*)/;
            let match = this.customPage.match(re);
            if (match) {
              console.log(match);
              if (match[1]) {
                from = parseInt(match[1]);
              } else {
                from = 1;
              }

              if (match[2]) {
                to = this.doc.pages.length;
              } else {
                to = from;
              }

              if (match[3]) {
                to = parseInt(match[3]);
              }
            } else {
              from = -1;
            }
          }
          this.close();

          if (from != -1) {
            this.send('Controller:exportPage', this.type, this.scale, from, to);
          }
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
      editor: null,
      ...state,
    });


    [
      ui.createText('VerySlide', 'vs-logo'),
      new ui.Text({'title': 'Page'}),
      ui.createButton('Add',    () => { this.send('Controller:addPage'); }),
      this.btnUndo = ui.createButton('Undo', () => this.send('Controller:history', 'Undo')),
      this.btnRedo = ui.createButton('Redo', () => this.send('Controller:history', 'Redo')),

      new ui.Text({'title': 'Zoom'}),
      ui.HGroup(
        ui.createButton('-', () => { this.send('Viewport:zoomToPreset', -1); }, 'vs-button xs'),
        this.zoomDisplay = new ui.InputText({
          value: '100%',
        }),
        ui.createButton('+', () => { this.send('Viewport:zoomToPreset', 1); }, 'vs-button xs'),
        ui.createButton('Reset', () => { this.resetZoom(); }),
        this.btnSnap = ui.createButton('Snap', () => { this.toggleSnap(); }),
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
    this.listen('Menu:zoomChanged', this.updateZoomDisplay);

    this.zoomDisplay.onChange = (value) => {
      let numericValue = value.replace('%', '');
      if (!isNaN(numericValue) && numericValue !== '') {
        let scale = parseFloat(numericValue) / 100;
        this.send('Viewport:zoom', scale);
        this.zoomDisplay.node.blur();
      }
    };

    this.btnUndo.enable(false);
    this.btnRedo.enable(false);
  }

  historyChanged(undoable, redoable) {
    this.btnUndo.enable(undoable);
    this.btnRedo.enable(redoable);
  }

  updateZoomDisplay(scale) {
    this.zoomDisplay.value = Math.round(scale * 100) + '%';
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
    this.send('Viewport:resetZoom');
  }

  toggleSnap() {
    let snap = this.send('Viewport:toggleSnap')[0];
    // TBD: 나중에 눌림 버튼 만들어지면 교체
    // if (snap) {
    //   this.btnSnap.title = 'Snap On';
    // } else {
    //   this.btnSnap.title = 'Snap Off';
    // }
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
      editor: null,
      ...state,
    });

    this.page = null;

    this.mode = 'normal'; // normal, scroll, select
    this.dragStart = undefined;
    this.translate = {x: 0, y: 0};
    this.lastTranslate = {x: 0, y: 0};
    this.scale = 1.0;
    this.scalePresets = [0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0];
    this.isPresentationMode = false;

    this.listen('Viewport:get', () => { return this });
    this.listen('Viewport:focusPage', this.focusPage);
    this.listen('Viewport:clear', this.clear);
    this.listen('Viewport:move', this.move);
    this.listen('Viewport:zoom', this.zoom);
    this.listen('Viewport:resetZoom', this.resetZoom);
    this.listen('Viewport:zoomToPreset', this.zoomToPreset);
    this.listen('Viewport:toggleSnap', this.toggleSnap);
    this.listen('Viewport:setPresentationMode', this.setPresentationMode);

    this.interval = setInterval(this.updateThumbnail.bind(this), 2000);
    this.keydownEvents = [
      // Navigation
      { key: 'Space', action: () => this.beginGrab(), desc: 'Start grab mode' },
      { key: 'Tab', action: () => this.selectObject(1), desc: 'Select next object' },
      { key: 'Shift+Tab', action: () => this.selectObject(-1), desc: 'Select previous object' },
      { key: 'ArrowLeft', action: () => this.send('Controller:move', 'Left'), desc: 'Move left' },
      { key: 'ArrowUp', action: () => this.send('Controller:move', 'Up'), desc: 'Move up' },
      { key: 'ArrowRight', action: () => this.send('Controller:move', 'Right'), desc: 'Move right' },
      { key: 'ArrowDown', action: () => this.send('Controller:move', 'Down'), desc: 'Move down' },
      { key: 'Shift+ArrowLeft', action: () => this.send('Controller:move', 'BigLeft'), desc: 'Move left (large)' },
      { key: 'Shift+ArrowUp', action: () => this.send('Controller:move', 'BigUp'), desc: 'Move up (large)' },
      { key: 'Shift+ArrowRight', action: () => this.send('Controller:move', 'BigRight'), desc: 'Move right (large)' },
      { key: 'Shift+ArrowDown', action: () => this.send('Controller:move', 'BigDown'), desc: 'Move down (large)' },

      // Zoom & View
      { key: 'Minus', action: () => this.zoomToPreset(-1), desc: 'Zoom out' },
      { key: 'Equal', action: () => this.zoomToPreset(1), desc: 'Zoom in' },
      { key: 'Backslash', action: () => this.fitWidth(), desc: 'Fit width' },
      { key: 'Digit0', action: () => this.resetZoom(), desc: 'Reset zoom' },
      { key: 'KeyS', action: () => this.send('Menu:toggleSnap', null), desc: 'Toggle snap' },
      { key: 'Escape', action: () => this.setPresentationMode(false), desc: 'Exit presentation' },

      // Object Operations
      { key: 'Delete', action: () => this.send('Controller:remove'), desc: 'Delete object' },
      { key: 'Backspace', action: () => this.send('Controller:remove'), desc: 'Delete object' },
      { key: 'BracketLeft', action: () => this.send('Controller:order', 'backward'), desc: 'Send backward' },
      { key: 'BracketRight', action: () => this.send('Controller:order', 'forward'), desc: 'Send forward' },

      // Text Styling (Cmd/Ctrl)
      { key: 'Cmd+KeyB', action: () => this.send('Controller:style', 'Bold'), desc: 'Bold' },
      { key: 'Cmd+KeyI', action: () => this.send('Controller:style', 'Italic'), desc: 'Italic' },
      { key: 'Cmd+KeyU', action: () => this.send('Controller:style', 'Underline'), desc: 'Underline' },
      { key: 'Cmd+Minus', action: () => this.send('Controller:style', 'Smaller'), desc: 'Smaller font' },
      { key: 'Cmd+Equal', action: () => this.send('Controller:style', 'Bigger'), desc: 'Bigger font' },

      // Document Operations
      { key: 'Cmd+KeyS', action: () => this.send('Veryslide:save'), desc: 'Save' },
      { key: 'Alt+KeyN', action: () => this.send('Controller:addPage'), desc: 'Add page' },
      { key: 'Cmd+KeyZ', action: () => this.send('Controller:history', 'Undo'), desc: 'Undo' },
      { key: 'Cmd+KeyY', action: () => this.send('Controller:history', 'Redo'), desc: 'Redo' },
      { key: 'Shift+Cmd+KeyZ', action: () => this.send('Controller:history', 'Redo'), desc: 'Redo' },

      // Selection
      { key: 'Cmd+KeyA', action: () => this.send('Controller:selectAll'), desc: 'Select all' },
      { key: 'Cmd+KeyD', action: () => this.send('Controller:deselect'), desc: 'Deselect' },

      // Style Copy/Paste
      { key: 'Alt+Cmd+KeyC', action: () => this.send('Controller:copyStyle'), desc: 'Copy style' },
      { key: 'Alt+Cmd+KeyV', action: () => this.send('Controller:pasteStyle'), desc: 'Paste style' },
    ];
    this.keyupEvents = [
      { key: 'Space', action: () => this.resetMode(), desc: 'Reset grab mode' },
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
      let cx = (x - this.translate.x) / this.scale;
      let cy = (y - this.translate.y) / this.scale;
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

          // Check if click is within page bounds
          let cx = (x - this.translate.x) / this.scale;
          let cy = (y - this.translate.y) / this.scale;
          if (cx >= 0 && cx <= this.page.width && cy >= 0 && cy <= this.page.height) {
            this.send('Controller:select', this.page);
          }
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
    if (global.exporting) return;
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
    this.send('Menu:zoomChanged', this.scale);
  }


  zoomToPreset(direction) {
    let newScale;
    if (direction > 0) {
      newScale = this.scalePresets.find(preset => preset > this.scale) || this.scalePresets[this.scalePresets.length - 1];
    } else {
      newScale = this.scalePresets.slice().reverse().find(preset => preset < this.scale) || this.scalePresets[0];
    }
    this.zoomWithCenter(newScale);
  }

  zoomWithCenter(newScale) {
    if (this.page == null) return;

    const viewportWidth = this.node.clientWidth;
    const viewportHeight = this.node.clientHeight;
    const pageWidth = this.page.width;
    const pageHeight = this.page.height;

    this.scale = newScale;
    this.translate.x = (viewportWidth - pageWidth * this.scale) / 2;
    this.translate.y = (viewportHeight - pageHeight * this.scale) / 2;
    this.updateTransform();
    this.send('Menu:zoomChanged', this.scale);
  }

  resetZoom() {
    this.zoomWithCenter(1.0);
  }

  fitWidth() {
    if (this.page == null) return;

    const viewportWidth = this.node.clientWidth;
    const pageWidth = this.page.width;
    const scale = viewportWidth / pageWidth;

    this.zoomWithCenter(scale);
  }

  selectObject(direction) {
    if (this.page == null) return;

    const currentSelection = this.send('Controller:getSelection')[0];
    const allObjects = this.page.objects;

    if (allObjects.length === 0) return;

    if (currentSelection.length === 0) {
      const targetIndex = direction > 0 ? 0 : allObjects.length - 1;
      this.send('Controller:select', allObjects[targetIndex]);
    } else {
      const lastSelectedObject = currentSelection[currentSelection.length - 1];
      const currentIndex = allObjects.indexOf(lastSelectedObject);
      const targetIndex = (currentIndex + direction + allObjects.length) % allObjects.length;
      this.send('Controller:select', allObjects[targetIndex]);
    }
  }

  keydown(event) {
    if (event.target !== document.body && event.target !== this.node) {
      return;
    }

    this.keydownEvents.forEach(shortcut => {
      if (this.matchesKeyboardShortcut(event, shortcut.key)) {
        event.preventDefault();
        shortcut.action(event);
      }
    });
  }

  matchesKeyboardShortcut(event, keyString) {
    const parts = keyString.split('+');
    const key = parts[parts.length - 1];
    const modifiers = parts.slice(0, -1);

    const hasShift = modifiers.includes('Shift');
    const hasCtrl = modifiers.includes('Ctrl');
    const hasAlt = modifiers.includes('Alt');
    const hasCmd = modifiers.includes('Cmd');

    if (event.shiftKey !== hasShift ||
        event.ctrlKey !== hasCtrl ||
        event.altKey !== hasAlt ||
        event.metaKey !== hasCmd) {
      return false;
    }

    return event.code === key;
  }

  keyup(event) {
    if (event.target !== document.body && event.target !== this.node) {
      return;
    }

    this.keyupEvents.forEach(shortcut => {
      if (this.matchesKeyboardShortcut(event, shortcut.key)) {
        event.preventDefault();
        shortcut.action(event);
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
      this.send('Controller:deselect');
      this.editor.node.classList.add('Presentation');
      this.node.requestFullscreen();
    } else {
      this.editor.node.classList.remove('Presentation');
      // NOTE: this makes `Document not active` error occasionally, but I'm not sure how to prevent it.
      document.exitFullscreen().catch(() => {});;
      //this.send('Controller:select', this.page);
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
    this.appendChild(this.menu = new Menu({editor: this}));

    let row = new ui.Horizon();
    this.appendChild(row);

    row.appendChild(this.navigator = new Navigator());
    row.appendChild(this.viewport = new Viewport({editor: this}));
    row.appendChild(this.toolbox = new ToolBox());

    return this.node;
  }
}

export default Editor