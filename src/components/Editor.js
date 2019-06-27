import './Editor.scss';
import { parse } from 'papaparse';
import ui from './ui/UI';
import View from './ui/View';
import Panel from './ui/Panel';
import PageList from './PageList';
import Handler from './Handler';
import channel from '../core/Channel';
import List from '../core/List';
import { randomInt } from '../core/Util';


class Menu extends View {
  constructor(state) {
    super({
      className: 'vs-menu',
    }.update(state));

    [
      ui.createButton(this, 'Add a page',    () => { channel.send('Document:addPage'); }),
      ui.createButton(this, 'Remove page',   () => { channel.send('Document:removePage'); }),
      ui.createButton(this, 'Reset zoom',    () => { this.resetZoom(); }),
      this.btnSnap = 
      ui.createButton(this, 'Snap Off',      () => { this.toggleSnap(); }),
      ui.createButton(this, 'New TextBox',   () => { channel.send('Document:addObject', 'TextBox'); }),
      ui.createButton(this, 'New Image',     () => { channel.send('Document:addObject', 'ImageBox'); }),
      ui.createButton(this, 'New ImageList', () => { channel.send('Document:addObject', 'ImageList'); }),
      ui.createButton(this, 'Remove object', () => { channel.send('Document:removeObject'); }),
    ].forEach(item => this.appendChild(item));

    channel.bind(this, 'Menu:resetZoom', this.resetZoom);
    channel.bind(this, 'Menu:toggleSnap', this.toggleSnap);

    this.render();
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
      children: new List(new PageList()),
    }.update(state));
  }
}

class Viewport extends View {
  constructor(state) {
    super({
      className: 'vs-viewport',
    }.update(state));

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

    setInterval(this.updateThumbnail.bind(this), 500)
  }

  updateThumbnail() {
    if (this.page == null) return;
    this.page.pagethumb.updateThumbnail();
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

  toggleSnap() {
    this.snap = !this.snap;
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

  render() {
    super.render();
    this.node.tabIndex = '0';

    window.addEventListener('keydown', event => {
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
    });

    window.addEventListener('keyup', event => {
      if (event.keyCode === 32) {
        event.preventDefault();
        this.node.style.cursor = 'default';
        this.grab = false;
      }
    });

    this.node.addEventListener('mousemove', event => {
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

    this.node.addEventListener('mousedown', event => {

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

    this.node.addEventListener('mouseup', () => {
      if (this.grab === true) {
        this.node.style.cursor = 'grab';
        this.drag = false;
      }
    });

    this.node.addEventListener('mouseleave', () => {
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
    this.appendChild(ui.createText(this, 'PanelForDocument'));
    return this.node;
  }
}

class PanelForPage extends Panel {
  render() {
    super.render();
    [
      ui.createText  (this, 'PanelForPage'),
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
      ui.createText  (this, 'PanelForBox'),
      ui.createButton(this, 'Back',       () => { channel.send('Document:orderBack', this.object); }),
      ui.createButton(this, 'Front',      () => { channel.send('Document:orderFront', this.object); }),
      ui.createButton(this, 'Backward',   () => { channel.send('Document:orderBackward', this.object); }),
      ui.createButton(this, 'Forward',    () => { channel.send('Document:orderForward', this.object); }),

      ui.createText(this, 'Background Color'),
      new ui.ColorButton({ 
        color: this.object.color,
        onChange: value => { this.object.color = value; }, 
      }),

      ui.createText(this, 'Border'),
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

      ui.createText(this, 'Padding'),
      new ui.InputText({
        value: this.object.padding, 
        onChange: value => { this.object.padding = value },
      }),
    ].forEach(item => this.appendChild(item));
    return this.node;
  }
}

class PanelForTextBox extends PanelForBox {
  render() {
    super.render();

    [
      ui.createText(this, 'PanelForTextBox'),

      ui.createText(this, 'Text'),
      new ui.InputText({
        value: this.object.text, 
        onChange: value => { this.object.text = value },
      }),

      ui.createText(this, 'Size'),
      new ui.InputText({
        value: this.object.size, 
        onChange: value => { this.object.size = value },
      }),

      ui.createText(this, 'Style'),
      new ui.Select({
        options: [['serif', 'Serif'], ['sans-serif', 'Sans serif'], ['monospace', 'Monospace']],
        value: this.object.fontFamily,
        onChange: value => { this.object.fontFamily = value },
      }),

      new ui.ColorButton({
        color: this.object.textColor,
        onChange: value => { this.object.textColor = value },
      }),

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

      ui.createText(this, 'Text Alignment'),
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
    ].forEach(item => this.appendChild(item));

    return this.node;
  }
}

class PanelForImageBox extends Panel {
  render() {
    super.render();
    this.appendChild(ui.createText(this, 'PanelForImageBox'));

    var input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', event => {
      var file = event.target.files[0];
      this.object.file = file;
    });
    this.node.appendChild(input);

    return this.node;
  }
}

class PanelForImageList extends PanelForBox {
  render() {
    super.render();
    this.appendChild(ui.createText(this, 'PanelForImageList'));

    var input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', event => {
      // getting a hold of the file reference
      var file = event.target.files[0];

      // setting up the reader
      var reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      // here we tell the reader what to do when it's done reading...
      reader.onload = readerEvent => {
        var csv = readerEvent.target.result; // this is the content!
        var results = parse(csv, {header: true});

        var item_count = randomInt(10, 100);
        var item_start = randomInt(0, results.data.length - item_count);

        for(var i = item_start; i < item_start + item_count; i++) {
          var data = results.data[i];
          console.log(data);

          let node = document.createElement('img');
          node.src = 'static/logo/' + data['UID'] + '.png';
          node.style.maxHeight = this.object.itemMaxHeight + 'px';
          node.style.maxWidth = this.object.itemMaxWidth + 'px';
          node.style.margin = this.object.itemMargin + 'px';
          this.object.node.appendChild(node);
          this.object.record();
        }

        /*

        item.height(item_height);
        item.html(
            "<div class='aligner' data-toggle='tooltip' title='" + data['Name'] + "'>"
            + "<a target='_blank' href='" + data['Homepage'] + "'>"
            + "<img src='" + data['Image URL'] + "' style='max-height:" + item_height + "px; max-width:" + (item_height * 2) + "px'>"
            + "</a></div>");
        item.data('name', data['Name (English)']);
        content.append(item);
        */
      }
    });
    this.node.appendChild(input);
    [
      ui.createText(this, 'Align items'),
      ui.createButton(this, 'Shuffle', () => { this.object.shuffle(); }),

      ui.createText(this, 'Width'),
      new ui.InputText({
        value: this.object.itemMaxWidth, 
        onChange: value => { this.object.itemMaxWidth = value },
      }),

      ui.createText(this, 'Height'),
      new ui.InputText({
        value: this.object.itemMaxHeight, 
        onChange: value => { this.object.itemMaxHeight = value },
      }),

      ui.createText(this, 'Margin'),
      new ui.InputText({
        value: this.object.itemMargin, 
        onChange: value => { this.object.itemMargin = value },
      }),

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
    ].forEach(item => this.appendChild(item));

    return this.node;
  }
}

class Property extends View {
  constructor(state) {
    super({
      className: 'vs-property',
      object: null,
    }.update(state));

    channel.bind(this, 'Property:setPanelFor', this.setPanelFor);
  }

  setPanelFor(object) {
    this.panel.clear();

    switch(object.name) {
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
    this.titlebar.title = object.name + ' Property';
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
    }.update(state));
  }

  render() {
    super.render();
    this.appendChild(new Menu());

    let row = new ui.Horizon();
    this.appendChild(row);

    row.appendChild(new Navigator());
    row.appendChild(new Viewport());
    row.appendChild(new ToolBox({children: new List(
      new Property(),
    )}));

    return this.node;
  }
}

export default Editor
