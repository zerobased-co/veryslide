import './Editor.scss';
import ui from './ui/UI';
import View from './ui/View';
import Panel from './ui/Panel';
import PageList from './PageList';
import AssetList from './AssetList';
import Handler from './Handler';
import channel from '../core/Channel';


class Menu extends View {
  constructor(state) {
    super({
      className: 'vs-menu',
      ...state,
    });

    [
      new ui.Text({'title': 'Page'}),
      ui.HGroup(
        ui.createButton('Add',    () => { channel.send('Controller:addPage'); }),
        ui.createButton('Remove',   () => { channel.send('Controller:removePage'); }),
      ),

      new ui.Text({'title': 'Viewport'}),
      ui.HGroup(
        ui.createButton('Reset zoom',    () => { this.resetZoom(); }),
        this.btnSnap = 
        ui.createButton('Snap Off',      () => { this.toggleSnap(); }),
      ),

      new ui.Text({'title': 'Object'}),
      ui.HGroup(
        ui.createButton('TextBox',   () => { channel.send('Controller:addObject', 'TextBox'); }),
        ui.createButton('Image',     () => { this.openFileDialog(); }),
        ui.createButton('ImageList', () => { channel.send('Controller:addObject', 'ImageList'); }),
      ),
      ui.createButton('Remove', () => { channel.send('Controller:removeObject'); }),

      new ui.Text({'title': 'Misc'}),
      ui.HGroup(
        ui.createButton('Image', () => { channel.send('Controller:savePage', 'image'); }),
        //ui.createButton('PDF',   () => { channel.send('Controller:savePage', 'pdf'); }),
        ui.createButton('Save',   () => { channel.send('Veryslide:save'); }),
      ),

      ui.createButton('Close',   () => { 
        window.history.back();
      }),
    ].forEach(item => this.appendChild(item));


    channel.bind(this, 'Menu:resetZoom', this.resetZoom);
    channel.bind(this, 'Menu:toggleSnap', this.toggleSnap);
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
          channel.send('Controller:addObject', 'ImageBox', {
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
    channel.send('Viewport:zoom', 1.0);
    channel.send('Viewport:move', [0, 0]);
  }

  toggleSnap() {
    let snap = channel.send('Viewport:toggleSnap')[0];
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

class Viewport extends View {
  constructor(state) {
    super({
      className: 'vs-viewport',
      ...state,
    });

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

    channel.bind(this, 'Viewport:selectPage', this.selectPage);
    channel.bind(this, 'Viewport:clear', this.clear);
    channel.bind(this, 'Viewport:move', this.move);
    channel.bind(this, 'Viewport:zoom', this.zoom);
    channel.bind(this, 'Viewport:focus', this.focus);
    channel.bind(this, 'Viewport:blur', this.blur);
    channel.bind(this, 'Viewport:toggleSnap', this.toggleSnap);

    this.interval = setInterval(this.updateThumbnail.bind(this), 2000);
    this.keydownEvents = [
    // shift, ctrl,  alt,   meta,  keycodes, func
      [false, false, false, false, [32], () => this.beginGrab()],
      [false, false, false, false, [173, 189], () => this.zoomOut()],
      [false, false, false, false, [61, 187], () => this.zoomIn()],
      [false, false, false, false, [83], () => channel.send('Menu:toggleSnap', null)],
      [false, false, false, false, [48], () => channel.send('Menu:resetZoom', null)],
      [false, false, false, false, [46, 8], () => channel.send('Controller:removeObject', this.object)],
      [false, false, false, false, [219], () => channel.send('Controller:orderBackward', this.object)],
      [false, false, false, false, [221], () => channel.send('Controller:orderForward', this.object)],
      [false, false, false, true,  [66], () => this.applyStyle('Bold')],
      [false, false, false, true,  [73], () => this.applyStyle('Italic')],
      [false, false, false, true,  [85], () => this.applyStyle('Underline')],
      [false, false, false, true,  [83], () => channel.send('Veryslide:save')],
      [false, false, false, true,  [173, 189], () => this.applyStyle('Smaller')],
      [false, false, false, true,  [61, 187], () => this.applyStyle('Bigger')],
    ];
    this.keyupEvents = [
    // shift, ctrl,  alt,   meta,  keycodes, func
      [false, false, false, false, [32], () => this.endGrab()],
    ];

    ['copy', 'paste', 'keydown', 'keyup'].forEach(e => {
      this.addEventListener(e, this[e], window);
    }, this);

    this.addEventListener('mousemove', event => {
      event.preventDefault();

      if (this.page == null) return;
      if (this.drag === true) {
        let dx = event.clientX - this.dragStart.x;
        let dy = event.clientY - this.dragStart.y;

        this.translate.x = dx;
        this.translate.y = dy;
        this.updateTransform();
      }
    });

    this.addEventListener('mousedown', event => {

      if (this.page == null) return;
      if (this.grab === true) {
        event.preventDefault();

        this.node.style.cursor = 'grabbing';
        this.drag = true;
        this.dragStart = {
          x: event.clientX - this.translate.x,
          y: event.clientY - this.translate.y,
        }
      } else {
        let rect = this.page.node.getBoundingClientRect();
        let x = (event.clientX - rect.x) / this.scale;
        let y = (event.clientY - rect.y) / this.scale;

        let pickedObject = this.page.findObject(x, y);
        if (pickedObject != null) {
          if (event.detail >= 2) {
            // edit if available
            event.preventDefault();
            this.editable(pickedObject);
          } else {
            if (pickedObject != this.object) {
              event.preventDefault();
              this.focus(pickedObject);
              // pass event to handler for allowing drag instantly
              this.handler.mousedown(event);
            }
          }
        } else {
          this.blur();
        }
      }
    });

    this.addEventListener('mouseup', () => {
      if (this.grab === true) {
        this.node.style.cursor = 'grab';
        this.drag = false;
      }
    });

    this.addEventListener('mouseleave', () => {
      this.node.style.cursor = 'default';
      this.grab = false;
      this.drag = false;
    });

  }

  beginGrab() {
    if (this.grab === false) {
      this.node.style.cursor = 'grab';
      this.grab = true;
      this.blur();
    }
  }

  endGrab() {
    this.node.style.cursor = 'default';
    this.grab = false;
  }

  applyStyle(style) {
    switch(style) {
      case 'Bold':
        if (typeof this.object.toggleBold === 'function') {
          this.object.toggleBold();
        }
        break;
      case 'Italic':
        if (typeof this.object.toggleItalic === 'function') {
          this.object.toggleItalic();
        }
        break;
      case 'Underline':
        if (typeof this.object.toggleUnderline === 'function') {
          this.object.toggleUnderline();
        }
        break;
      case 'Bigger':
        if (typeof this.object.bigger === 'function') {
          this.object.bigger();
        }
        break;
      case 'Smaller':
        if (typeof this.object.smaller === 'function') {
          this.object.smaller();
        }
        break;
    }
  }

  updateThumbnail() {
    if (this.page == null) return;
    if (this.grab || this.drag || this.handler.handling) return;
    this.page.updateThumbnail();
  }

  destroy() {
    super.destroy();
    clearInterval(this.interval);
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
    this.page = page;

    this.node.append(this.page.node);
    this.page.node.appendChild(this.handler.node);

    this.updateTransform();
    this.setPageSnap();
    channel.send('Controller:selectPage', page);
    channel.send('Property:setPanelFor', page);
  }
  
  setPageSnap() {
    if (this.page) {
      if (this.snap) {
        this.page.node.classList.add('snap');
      } else {
        this.page.node.classList.remove('snap');
      }
    }
  }

  toggleSnap(show = null) {
    if (show != null) {
      this.snap = show;
    } else {
      this.snap = !this.snap;
    }
    this.handler.snap = this.snap;
    this.setPageSnap();
    return this.snap;
  }

  updateTransform() {
    if (this.page == null) return;
    this.page.node.style.transform = 'translate(' + this.translate.x + 'px, ' + this.translate.y + 'px) scale(' + this.scale + ')';
    this.handler.updateTransform();
  }

  focus(object) {
    this.object = object;
    this.handler.connect(object);
    channel.send('Controller:selectObject', this.object);
    channel.send('Property:setPanelFor', this.object);
  }

  editable(object) {
    this.blur();
    this.object = object;
    if (object.editable != null) {
      object.editable();
    }
  }

  blur() {
    // get back the focus
    this.node.focus();

    if (this.object && this.object.blur != null) {
      this.object.blur();
    }

    this.object = null;
    this.handler.show(false);
    channel.send('Controller:selectObject', null);
    if (this.page) {
      channel.send('Property:setPanelFor', this.page);
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
    channel.send('Controller:copy');
  }

  paste(event) {
    channel.send('Controller:paste');
  }

  render() {
    super.render();
    this.node.tabIndex = '0';
    this.handler = new Handler();
    this.handler.viewport = this;

    return this.node;
  }
}

class PanelForDocument extends Panel {
  render() {
    super.render();
    this.appendChild(ui.createText('PanelForDocument'));
    return this.node;
  }
}

class PanelForPage extends Panel {
  render() {
    super.render();
    [
      new ui.TitleBar({'title': 'Page style'}),
      ui.H(
        ui.createText('Background'),
        new ui.ColorButton({
          color: this.object.color,
          onChange: value => { this.object.color = value; },
        }),
      ),
    ].forEach(item => this.appendChild(item));
    return this.node;
  }
}

class PanelForBox extends Panel {
  render() {
    super.render();
    [
      new ui.TitleBar({'title': 'Object style'}),
      ui.H(
        ui.createText('Object'),
        ui.V(
          ui.H(
            ui.createText('Position'),
            ui.createInputText(this.object, 'x'),
            ui.createInputText(this.object, 'y'),
          ),
          ui.H(
            ui.createText('Size'),
            ui.createInputText(this.object, 'width'),
            ui.createInputText(this.object, 'height'),
          ),
        ),
      ),
      ui.H(
        ui.createText('Order'),
        new ui.Vertical({children: [
          ui.HGroup(
            ui.createButton('Back',       () => { channel.send('Controller:orderBack', this.object); }),
            ui.createButton('Front',      () => { channel.send('Controller:orderFront', this.object); }),
          ),
          ui.HGroup(
            ui.createButton('Backward',   () => { channel.send('Controller:orderBackward', this.object); }),
            ui.createButton('Forward',    () => { channel.send('Controller:orderForward', this.object); }),
          ),
        ]}),
      ),

      ui.H(
        ui.createText('Background'),
        new ui.ColorButton({
          color: this.object.color,
          onChange: value => { this.object.color = value; },
        }),
      ),

      ui.H(
        ui.createText('Border'),
        new ui.Select({
          options: [['none', '----'], ['solid', 'Solid'], ['dashed', 'Dashed']],
          value: this.object.borderStyle,
          onChange: value => { this.object.borderStyle = value },
        }),
        new ui.InputText({
          value: this.object.borderWidth, 
          onChange: value => { this.object.borderWidth = value },
        }),
        new ui.ColorButton({ 
          color: this.object.borderColor,
          onChange: value => { this.object.borderColor = value; }, 
        }),
      ),

      ui.H(
        ui.createText('Padding'),
        new ui.InputText({
          value: this.object.padding, 
          onChange: value => { this.object.padding = value },
        }),
      ),
    ].forEach(item => this.appendChild(item));
    return this.node;
  }
}

class PanelForTextBox extends PanelForBox {
  render() {
    super.render();

    [
      new ui.TitleBar({'title': 'Text style'}),
      ui.H(
        ui.createText('Color'),
        new ui.ColorButton({ 
          color: this.object.textColor,
          onChange: value => { this.object.textColor = value; }, 
        }),
      ),

      ui.H(
        ui.createText('Font'),
        new ui.InputText().bind(this.object, 'size'),
        new ui.Select({
          options: [['serif', 'Serif'], ['sans-serif', 'Sans serif'], ['monospace', 'Monospace']],
          value: this.object.fontFamily,
          onChange: value => { this.object.fontFamily = value },
        }),
      ),

      ui.H(
        ui.createText('Style'),
        new ui.CheckBox({
          title: 'Bold',
        }).bind(this.object, 'bold'),
        new ui.CheckBox({
          title: 'Italic',
        }).bind(this.object, 'italic'),
        new ui.CheckBox({
          title: 'Underline',
        }).bind(this.object, 'underline'),
      ),

      ui.H(
        ui.createText('Word Break'),
        new ui.Select({
          options: [['normal', 'Normal'], ['break-all', 'Break All'], ['keep-all', 'Keep All'], ['break-word', 'Break Word']],
        }).bind(this.object, 'wordBreak'),
      ),

      ui.H(
        ui.createText('Alignment'),
        new ui.Select({
          options: [['left', 'Left'], ['center', 'Center'], ['right', 'Right']],
          value: this.object.align,
          onChange: value => { this.object.align = value },
        }),
        new ui.Select({
          options: [['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom']],
          value: this.object.verticalAlign,
          onChange: value => { this.object.verticalAlign = value },
        }),
      ),
    ].forEach(item => this.appendChild(item));

    return this.node;
  }
}

class PanelForImageBox extends PanelForBox {
  render() {
    super.render();

    // TBD: We cannot change image after creation
    [
      new ui.TitleBar({'title': 'Image'}),
      ui.H(
        ui.createText('Reset'),
        ui.createButton('Original size', () => { 
          this.object.resetSize();
        }),
      ),
    ].forEach(item => this.appendChild(item));

    return this.node;
  }
}

class PanelForImageList extends PanelForBox {
  render() {
    super.render();

    if (this.object.items.length == 0) {
      this.object.update();
    }

    this.assets = channel.send('Controller:getAssetList')[0];
    this.dataOptions = [['none', '----']].concat(this.assets.array.map(x => [x.name, x.name]));

    [
      new ui.TitleBar({title: 'List Property'}),
      ui.H(
        ui.createText('Data Asset'),
        new ui.Select({
          value: this.object.asset,
          options: this.dataOptions,
          onChange: (value) => { 
            this.object.asset = value;
            channel.send('Property:setPanelFor', this.object);
          },
        }),
        ui.createText(
          '&nbsp;' + this.object.selectedItems.length + ' of ' + this.object.items.length + ' Item(s)',
          'vs-text-140',
        ),
      ),

      ui.H(
        ui.createText('Control'),
        ui.HGroup(
          ui.createButton('Clear', () => { this.object.clear(); }),
          ui.createButton('Shuffle', () => { this.object.shuffle(); }),
          ui.createButton('Apply', () => { this.object.apply(); channel.send('Property:setPanelFor', this.object); }),
        ),
      ),

      ui.H(
        ui.createText('Icon'),
        ui.V(
          ui.H(
            ui.createText('Size'),
            new ui.InputText({
              value: this.object.itemMaxWidth, 
              onChange: value => { this.object.itemMaxWidth = value },
            }),
            new ui.InputText({
              value: this.object.itemMaxHeight, 
              onChange: value => { this.object.itemMaxHeight = value },
            }),
          ),
          ui.H(
            ui.createText('Margin'),
            new ui.InputText({
              value: this.object.itemMargin, 
              onChange: value => { this.object.itemMargin = value },
            }),
          ),
          ui.H(
            ui.createText('Arrange'),
            new ui.Select({
              options: [['row', 'Row'], ['column', 'Column']],
              value: this.object.itemDirection,
              onChange: value => { this.object.itemDirection = value },
            }),

            new ui.Select({
              options: [
                ['flex-start', 'Left'],
                ['center', 'Center'],
                ['flex-end', 'Right'],
                ['space-between', 'Justify'],
                ['space-around', 'Around'],
                ['space-evenly', 'Evenly']
              ],
              value: this.object.itemAlign,
              onChange: value => { this.object.itemAlign = value },
            }),
          ),
        ),
      ),

      new ui.TitleBar({title: 'Filter'}),
      new ui.Filter({
        fields: this.object.fields,
        items: this.object.items,
        filter: this.object.filter,
        onChange: value => { this.object.filter = value },
      }),
    ].forEach(item => this.appendChild(item));

    return this.node;
  }
}

class Property extends View {
  constructor(state) {
    super({
      className: 'vs-property',
      object: null,
      ...state,
    });

    channel.bind(this, 'Property:setPanelFor', this.setPanelFor);
  }

  setPanelFor(object) {
    this.panel.destroy();
    delete this.panel;

    switch(object.type) {
      case 'ImageList':
        this.panel = new PanelForImageList({object});
        break;
      case 'ImageBox':
        this.panel = new PanelForImageBox({object});
        break;
      case 'TextBox':
        this.panel = new PanelForTextBox({object});
        break;
      case 'Page':
        this.panel = new PanelForPage({object});
        break;
      case 'Document':
        this.panel = new PanelForDocument({object});
        break;
    }
    this.appendChild(this.panel);

    channel.send('ToolBox:activeTab', 'Property');
    return this.panel;
  }

  render() {
    super.render();

    this.panel = new ui.Panel();

    this.appendChild(this.panel);
    return this.node;
  }
}

class ToolBox extends View {
  constructor(state) {
    super({
      className: 'vs-toolbox',
      ...state,
    });

    channel.bind(this, 'ToolBox:activeTab', this.activeTab);
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
      ...state,
    });
  }

  render() {
    super.render();
    this.appendChild(new Menu());

    let row = new ui.Horizon();
    this.appendChild(row);

    row.appendChild(new Navigator());
    row.appendChild(new Viewport());
    row.appendChild(new ToolBox());

    return this.node;
  }
}

export default Editor
