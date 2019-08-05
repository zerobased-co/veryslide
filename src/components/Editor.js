import './Editor.scss';
import { parse } from 'papaparse';
import ui from './ui/UI';
import View from './ui/View';
import Panel from './ui/Panel';
import PageList from './PageList';
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
        ui.createButton('Add',    () => { channel.send('Document:addPage'); }),
        ui.createButton('Remove',   () => { channel.send('Document:removePage'); }),
      ),

      new ui.Text({'title': 'Viewport'}),
      ui.HGroup(
        ui.createButton('Reset zoom',    () => { this.resetZoom(); }),
        this.btnSnap = 
        ui.createButton('Snap Off',      () => { this.toggleSnap(); }),
      ),

      new ui.Text({'title': 'Object'}),
      ui.HGroup(
        ui.createButton('TextBox',   () => { channel.send('Document:addObject', 'TextBox'); }),
        ui.createButton('Image',     () => { this.openFileDialog(); }),
        ui.createButton('ImageList', () => { channel.send('Document:addObject', 'ImageList'); }),
      ),
      ui.createButton('Remove', () => { channel.send('Document:removeObject'); }),

      new ui.Text({'title': 'Misc'}),
      ui.HGroup(
        ui.createButton('Image', () => { channel.send('Document:savePage', 'image'); }),
        //ui.createButton('PDF',   () => { channel.send('Document:savePage', 'pdf'); }),
        ui.createButton('Save',   () => { channel.send('Veryslide:save'); }),
      ),

      ui.createButton('Close',   () => { 
        window.history.back();
      }),
    ].forEach(item => this.appendChild(item));


    channel.bind(this, 'Menu:resetZoom', this.resetZoom);
    channel.bind(this, 'Menu:toggleSnap', this.toggleSnap);

    this.render();
  }

  openFileDialog() {
    // create hidden file input
    var input = document.createElement('input');
    input.style.visibility = 'hidden';
    input.type = 'file';
    input.addEventListener('change', event => {
      // TBD: duplicated code
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.addEventListener("load", () => {
        var image = new Image();
        image.src = reader.result;
        image.onload =  () => {
          channel.send('Document:addObject', 'ImageBox', {
            width: image.width,
            height: image.height,
            src: image.src,
          });
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
  }

  updateThumbnail() {
    if (this.page == null) return;
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
    channel.send('Document:selectPage', page);
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
    channel.send('Document:selectObject', this.object);
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
    channel.send('Document:selectObject', null);
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

    // space
    if (event.keyCode === 32) {
      event.preventDefault();
      if (this.grab === false) {
        this.node.style.cursor = 'grab';
        this.grab = true;
        this.blur();
      }
    }

    // -
    if (event.keyCode === 173 || event.keyCode === 189) {
      this.zoomOut();
    }

    // +
    if (event.keyCode === 61 || event.keyCode === 187) {
      this.zoomIn();
    }

    // s
    if (event.keyCode === 83) {
      channel.send('Menu:toggleSnap', null);
    }

    // 0
    if (event.keyCode === 48) {
      channel.send('Menu:resetZoom', null);
    }

    // delete
    if (event.keyCode === 46 || event.keyCode === 8) {
      event.preventDefault();
      channel.send('Document:removeObject', this.object);
    }

    // [
    if (event.keyCode === 219) {
      channel.send('Document:orderBackward', this.object);
    }

    // ]
    if (event.keyCode === 221) {
      channel.send('Document:orderForward', this.object);
    }
  }

  keyup(event) {
    if (event.keyCode === 32) {
      event.preventDefault();
      this.node.style.cursor = 'default';
      this.grab = false;
    }
  }

  copy(event) {
    channel.send('Document:copy');
  }

  paste(event) {
    channel.send('Document:paste');
  }

  render() {
    super.render();
    this.node.tabIndex = '0';

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
      ui.createText('PanelForPage'),
      new ui.ColorButton({ 
        color: this.object.color,
        onChange: value => { this.object.color = value; }, 
      }),
    ].forEach(item => this.appendChild(item));
    return this.node;
  }
}

class PanelForBox extends Panel {
  render() {
    super.render();
    [
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
            ui.createButton('Back',       () => { channel.send('Document:orderBack', this.object); }),
            ui.createButton('Front',      () => { channel.send('Document:orderFront', this.object); }),
          ),
          ui.HGroup(
            ui.createButton('Backward',   () => { channel.send('Document:orderBackward', this.object); }),
            ui.createButton('Forward',    () => { channel.send('Document:orderForward', this.object); }),
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
      ui.H(
        ui.createText('Text'),
        new ui.InputText({
          value: this.object.text, 
          onChange: value => { this.object.text = value },
        }),
      ),

      ui.H(
        ui.createText('Color'),
        new ui.ColorButton({ 
          color: this.object.textColor,
          onChange: value => { this.object.textColor = value; }, 
        }),
      ),

      ui.H(
        ui.createText('Font'),
        new ui.InputText({
          value: this.object.size, 
          onChange: value => { this.object.size = value },
        }),
        new ui.Select({
          options: [['serif', 'Serif'], ['sans-serif', 'Sans serif'], ['monospace', 'Monospace']],
          value: this.object.fontFamily,
          onChange: value => { this.object.fontFamily = value },
        }),
        new ui.ColorButton({
          color: this.object.textColor,
          onChange: value => { this.object.textColor = value },
        }),
      ),

      ui.H(
        ui.createText('Style'),
        new ui.CheckBox({
          title: 'Bold',
          checked: this.object.bold,
          onChange: value => { this.object.bold = value },
        }),
        new ui.CheckBox({
          title: 'Italic',
          checked: this.object.italic,
          onChange: value => { this.object.italic = value },
        }),
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

    var input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', event => {
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.addEventListener("load", () => {
        var image = new Image();
        image.src = reader.result;
        image.onload =  () => {
          this.object.width = image.width;
          this.object.height = image.height;
          this.object.src = image.src;
          channel.send('Viewport:focus', this.object);
        }
      }, false);
      reader.readAsDataURL(file);
    });
    this.node.appendChild(input);

    return this.node;
  }
}

class PanelForImageList extends PanelForBox {
  render() {
    super.render();

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.addEventListener('change', event => {
      this.object.clear();

      // getting a hold of the file reference
      var file = event.target.files[0];

      // setting up the reader
      var reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      // here we tell the reader what to do when it's done reading...
      reader.onload = readerEvent => {
        var csv = readerEvent.target.result; // this is the content!
        var results = parse(csv, {header: true});

        this.object.fields = results.meta.fields;
        this.object.items = results.data;

        // refresh panel
        channel.send('Property:setPanelFor', this.object);
      }
    });

    [
      new ui.TitleBar({title: 'List Property'}),
      fileInput,
      this.itemCount = ui.createText(this.object.items.length + ' Item(s)'),

      ui.H(
        ui.createText('Control'),
        ui.HGroup(
          ui.createButton('Clear', () => { this.object.clear(); }),
          ui.createButton('Shuffle', () => { this.object.shuffle(); }),
          ui.createButton('Apply', () => { this.object.apply(); }),
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
    this.titlebar.title = object.type + ' Property';
    this.appendChild(this.panel);
    return this.panel;
  }

  render() {
    super.render();

    this.titlebar = new ui.TitleBar();
    this.titlebar.title = 'Property';
    this.panel = new ui.Panel();

    this.appendChild(this.titlebar);
    this.appendChild(this.panel);
    return this.node;
  }
}

class DataSetBox extends View {
  constructor(state) {
    super({
      className: 'vs-datasetbox',
      name: '',
      url: '',
      ...state,
    });
  }

  addSet() {
    console.log('addSet', this.name, this.url);
    channel.send('Document:addDataSet', {
      name: this.name,
      url: this.url,
    });

    // TBD: How can I improve this with binding?
    this.inputName.value = '';
    this.inputUrl.value = '';
  }

  render() {
    super.render();
    this.node.className = '';

    [
      new ui.TitleBar({title: 'Data Sets'}),
      ui.P(
        ui.HGroup(
          ui.createText('Name & URL'),
          this.inputName = ui.createInputText(this, 'name'),
          this.inputUrl = ui.createInputText(this, 'url'),
          ui.createButton('Add', () => { this.addSet(); }),
        ),
      ),
    ].forEach(item => this.appendChild(item));

    return this.node;
  }
}

class ToolBox extends View {
  render() {
    super.render();
    this.node.className = 'vs-toolbox';
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
    row.appendChild(new ToolBox({children: [
      new Property(),
      new DataSetBox(),
    ]}));

    return this.node;
  }
}

export default Editor
