import './Editor.scss';
import { parse } from 'papaparse';
import { ColorPicker } from 'codemirror-colorpicker'
import ui from './ui/UI';
import View from './ui/View';
import Panel from './ui/Panel';
import PageList from './PageList';
import Handler from './Handler';
import List from '../core/List';
import channel from '../core/Channel';
import { randomInt } from '../core/Util';


class Menu extends View {
  constructor(state) {
    super({
      className: 'vs-menu',
    }.update(state));

    this.btnAddPage = ui.createButton(this, 'Add a page', () => {
      channel.send('Document:addPage', null);
    });

    this.btnRemovePage = ui.createButton(this, 'Remove page', () => {
      channel.send('Document:removePage', null);
    });

    this.btnZoom = ui.createButton(this, 'Reset zoom', () => {
      this.resetZoom();
    });
    channel.bind(this, 'Menu:resetZoom', this.resetZoom);

    this.btnSnap = ui.createButton(this, 'Snap Off', () => {
      this.toggleSnap();
    });
    channel.bind(this, 'Menu:toggleSnap', this.toggleSnap);

    this.btnAddTextBox = ui.createButton(this, 'New TextBox', () => {
      channel.send('Document:addObject', 'TextBox');
    });

    this.btnAddImageList = ui.createButton(this, 'New ImageList', () => {
      channel.send('Document:addObject', 'ImageList');
    });

    this.btnRemoveObject = ui.createButton(this, 'Remove object', () => {
      channel.send('Document:removeObject', null);
    });
  }

  resetZoom() {
    channel.send('Viewport:zoom', 1.0);
    channel.send('Viewport:move', [0, 0]);
  }

  toggleSnap() {
    let snap = channel.send('Viewport:toggleSnap', null)[0];
    if (snap) {
      this.btnSnap.title = 'Snap On';
    } else {
      this.btnSnap.title = 'Snap Off';
    }
  }
}

class Navigator extends View {
  constructor(state) {
    super(state);
    this.pagelist = new PageList();
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-navigator';

    this.node.appendChild(this.pagelist.render());
    return this.node;
  }
}

class Page extends View {
  constructor(state) {
    super(state);
    this.page = null;
  }

  setup(page) {
    this.page = page;
  }

  findObject(x, y) {
    let found = null;
    this.page.objects.iter((object) => {
      if (object.contain(x, y) === true) {
        found = object;
      }
    });
    return found;
  }

  render() {
    this.node = this.page.render();
    //this.node.innerHTML = this.page.order;
    return this.node;
  }
}


class Viewport extends View {
  constructor(state) {
    super(state);

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
    this.page = new Page();
    this.page.setup(page);
    this.node.append(this.page.render());
    this.page.node.appendChild(this.handler.render());

    this.update();
    this.setPageSnap();
    channel.send('Document:selectPage', page);
    channel.send('Property:setPanelFor', page);
  }

  addObject(object) {
    this.page.node.append(object.render());
  }

  removeFocusedObject() {
    if (this.object == null) return;
    channel.send('Document:removeObject', this.object);
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

  update() {
    if (this.page == null) return;
    this.page.node.style.transform = 'translate(' + this.translate.x + 'px, ' + this.translate.y + 'px) scale(' + this.scale + ')';
    this.handler.update();
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
      channel.send('Property:setPanelFor', this.page.page);
    }
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
    this.update();
  }

  zoomOut() {
    this.scale = this.scale - 0.1;
    this.update();
  }

  zoomIn() {
    this.scale = this.scale + 0.1;
    this.update();
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-viewport';
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
        this.removeFocusedObject();
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
        this.update();
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
    this.handler.viewport = this;

    return this.node;
  }
}

class PanelForDocument extends Panel {
  render() {
    super.render();
    this.node.appendChild(ui.createText(this, 'PanelForDocument').render());
    return this.node;
  }
}

class PanelForPage extends Panel {
  render() {
    super.render();
    this.node.appendChild(ui.createText(this, 'PanelForPage').render());
    return this.node;
  }
}

class PanelForBox extends Panel {
  render() {
    super.render();
    this.node.appendChild(ui.createText(this, 'PanelForBox').render());

    this.btnOrderBack = ui.createButton(this, 'Back', () => {
      channel.send('Document:orderBack', this.object);
    });

    this.btnOrderFront = ui.createButton(this, 'Front', () => {
      channel.send('Document:orderFront', this.object);
    });

    this.btnOrderBackward = ui.createButton(this, 'Backward', () => {
      channel.send('Document:orderBackward', this.object);
    });

    this.btnOrderForward = ui.createButton(this, 'Forward', () => {
      channel.send('Document:orderForward', this.object);
    });

    this.btnColor = new ui.ColorButton({
      color: this.object.color,
      onChange: value => {
        this.object.color = value;
      },
    });

    this.node.appendChild(this.btnOrderBack.render());
    this.node.appendChild(this.btnOrderFront.render());
    this.node.appendChild(this.btnOrderBackward.render());
    this.node.appendChild(this.btnOrderForward.render());
    this.node.appendChild(this.btnColor.render());
    return this.node;
  }
}

class PanelForTextBox extends PanelForBox {
  render() {
    super.render();
    this.node.appendChild(ui.createText(this, 'PanelForTextBox').render());

    this.btnTextColor = new ui.ColorButton({
      color: this.object.textColor,
      onChange: value => {
        this.object.textColor = value;
      },
    });

    this.inputText = new ui.InputText();
    this.inputText.value = this.object.text;
    this.inputText.onChange = value => {
      this.object.text = value;
    };

    this.bold = new ui.CheckBox({checked: this.object.bold});
    this.bold.title = 'Bold';
    this.bold.onChange = value => {
      this.object.bold = value;
    };

    this.size = new ui.InputText();
    this.size.value = this.object.size;
    this.size.onChange = value => {
      this.object.size = value;
    };

    this.node.appendChild(this.btnTextColor.render());
    this.node.appendChild(this.inputText.render());
    this.node.appendChild(this.bold.render());
    this.node.appendChild(this.size.render());
    return this.node;
  }
}

class PanelForImageList extends PanelForBox {
  render() {
    super.render();
    this.node.appendChild(ui.createText(this, 'PanelForImageList').render());

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

        var item_height = randomInt(40, 60);
        var item_count = randomInt(10, 100);
        var item_start = randomInt(0, results.data.length - item_count);

        for(var i = item_start; i < item_start + item_count; i++) {
          var data = results.data[i];
          console.log(data);

          let node = document.createElement('img');
          node.src = 'static/logo/' + data['UID'] + '.png';
          node.style.maxHeight = item_height + 'px';
          node.style.maxWidth = (item_height * 1.25) + 'px';
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
    return this.node;
  }
}

class Property extends View {
  constructor(state) {
    super(state);

    this.titlebar = new ui.TitleBar();
    this.titlebar.title = 'Property';
    this.panel = new ui.Panel();
    this.object = null;

    channel.bind(this, 'Property:setPanelFor', this.setPanelFor);
  }

  setPanelFor(object) {
    this.panel.destruct();

    switch(object.name) {
      case 'ImageList':
        this.panel = new PanelForImageList();
        break;
      case 'TextBox':
        this.panel = new PanelForTextBox();
        break;
      case 'Page':
        this.panel = new PanelForPage();
        break;
      case 'Document':
        this.panel = new PanelForDocument();
        break;
    }
    this.panel.setObject(object);
    this.titlebar.title = object.name + ' Property';
    this.node.appendChild(this.panel.render());
    return this.panel;
  }

  render() {
    super.render();
    this.node.className = 'vs-property';
    this.node.appendChild(this.titlebar.render());
    this.node.appendChild(this.panel.render());
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
    super(state);

    this.menu = new Menu();
    this.navigator = new Navigator();
    this.viewport = new Viewport();
    this.toolbox = new ToolBox();
    this.property = new Property();
  }

  render() {
    super.render();
    this.node.className = 'vs-editor';
    this.node.appendChild(this.menu.render());

    let row = new ui.Horizon();
    this.node.appendChild(row.render());

    row.node.appendChild(this.navigator.render());
    row.node.appendChild(this.viewport.render());
    row.node.appendChild(this.toolbox.render());

    this.toolbox.node.appendChild(this.property.render());

    return this.node;
  }
}

export default Editor
