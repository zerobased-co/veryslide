import { parse } from 'papaparse';
import List from '../core/List';
import channel from '../core/Channel';
import { randomInt } from '../core/Util';

class Window {
  construct(parent) {
    this.parent = parent;
    this.node = null;
    this.title = '';
  }

  destruct() {
    this.node.parentNode.removeChild(this.node);
  }

  setTitle(title) {
    this.title = title;
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
    this.node.addEventListener('click', this.onClick.bind(this));
    return this.node;
  }

  setTitle(text) {
    super.setTitle(text);
    this.node.innerHTML = text;
  }

  onClick(event) {
  }
}

class Text extends Window {
  constructor(...args) {
    super(...args);
  }

  render() {
    this.node = document.createElement('p');
    this.node.innerHTML = this.title;
    this.node.className = 'vs-text';
    return this.node;
  }
}

class InputText extends Window {
  constructor(...args) {
    super(...args);
    this.value = null;
  }

  render() {
    this.node = document.createElement('input');
    this.node.type = 'text';
    this.node.value = this.value;
    this.node.className = 'vs-inputtext';
    this.node.addEventListener('input', this.input.bind(this));
    return this.node;
  }

  input(event) {
    this.value = this.node.value;
    this.onChange(this.value);
  }

  onChange(value) {
  }
}

class Menu extends Window {
  constructor(...args) {
    super(...args);

    this.btnAddPage = new Button(this);
    this.btnAddPage.title = 'Add a page';
    this.btnAddPage.onClick = event => {
      channel.send('Document:addPage', null);
    };

    this.btnRemovePage = new Button(this);
    this.btnRemovePage.title = 'Remove page';
    this.btnRemovePage.onClick = event => {
      channel.send('Document:removePage', null);
    };

    this.btnZoom = new Button(this);
    this.btnZoom.title = 'Reset zoom';
    this.btnZoom.onClick = this.resetZoom.bind(this);
    channel.bind(this, 'Menu:resetZoom', this.resetZoom);

    this.btnSnap = new Button(this);
    this.btnSnap.title = 'Snap Off';
    this.btnSnap.onClick = this.toggleSnap.bind(this);
    channel.bind(this, 'Menu:toggleSnap', this.toggleSnap);

    this.btnAddTextBox = new Button(this);
    this.btnAddTextBox.title = 'New TextBox';
    this.btnAddTextBox.onClick = event => {
      channel.send('Document:addObject', 'TextBox');
    };

    this.btnAddImageList = new Button(this);
    this.btnAddImageList.title = 'New ImageList';
    this.btnAddImageList.onClick = event => {
      channel.send('Document:addObject', 'ImageList');
    };

    this.btnRemoveObject = new Button(this);
    this.btnRemoveObject.title = 'Remove object';
    this.btnRemoveObject.onClick = event => {
      channel.send('Document:removeObject', null);
    };
  }

  resetZoom() {
    channel.send('Viewport:zoom', 1.0);
    channel.send('Viewport:move', [0, 0]);
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
    this.node.appendChild(this.btnAddImageList.render());
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
    this.viewport = null;

    this.transform = null;
    this.dragStart = undefined;
    this.basePos = undefined;
    this.baseSize = undefined;
    this.currentDot = null;
    this.snap = false;
    this.snapSize = 16;
    
    this.dotPreset = {
      'n': 'translate(-50%, -50%)',
      'e': 'translate(50%, -50%)',
      'w': 'translate(-50%, -50%)',
      's': 'translate(-50%, 50%)',
      'nw': 'translate(-50%, -50%)',
      'ne': 'translate(50%, -50%)',
      'se': 'translate(50%, 50%)',
      'sw': 'translate(-50%, 50%)',
    };
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

  update() {
    if (this.viewport == null) return;

    let dots = this.node.getElementsByClassName('vs-dot');
    for(var i = 0; i < dots.length; i++) {
      let type = dots[i].innerHTML;
      dots[i].style.transform = this.dotPreset[type] + ' scale(' + (1 / this.viewport.scale) + ')';
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
  }

  mouseup(event) {
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

    window.removeEventListener('mousemove', this.mousemove.bind(this));
    window.removeEventListener('mouseup', this.mouseup.bind(this));
  }

  mousedown(event) {
    if (this.object == null) return;

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
      event.stopPropagation();
    } else {
      this.transform = 'move';
    }
    window.addEventListener('mousemove', this.mousemove.bind(this));
    window.addEventListener('mouseup', this.mouseup.bind(this));
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

    this.node.addEventListener('mousedown', this.mousedown.bind(this));
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

  blur() {
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
      if (event.target !== document.body) {
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
      event.preventDefault();

      if (this.page == null) return;
      if (this.grab === true) {
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
          this.focus(pickedObject);
          // pass event to handler for allowing drag instantly
          this.handler.mousedown(event);
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

    this.handler = new Handler(this);
    this.handler.viewport = this;

    return this.node;
  }
}

class Panel extends Window {
  constructor(...args) {
    super(...args);
    this.object = null;
  }

  setObject(object) {
    this.object = object;
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-panel';
    this.node.appendChild(document.createTextNode("Panel"));
    return this.node;
  }
}

class PanelForDocument extends Panel {
  render() {
    super.render();
    this.node.appendChild(document.createTextNode("PanelForDoucment"));
    return this.node;
  }
}

class PanelForPage extends Panel {
  render() {
    super.render();
    this.node.appendChild(document.createTextNode("PanelForPage"));
    return this.node;
  }
}

class PanelForShape extends Panel {
  render() {
    super.render();
    this.node.appendChild(document.createTextNode("PanelForShape"));

    this.btnOrderBack = new Button(this);
    this.btnOrderBack.title = 'Back';
    this.btnOrderBack.onClick = event => {
      channel.send('Document:orderBack', this.object);
    };

    this.btnOrderFront = new Button(this);
    this.btnOrderFront.title = 'Front';
    this.btnOrderFront.onClick = event => {
      channel.send('Document:orderFront', this.object);
    };

    this.btnOrderBackward = new Button(this);
    this.btnOrderBackward.title = 'Backward';
    this.btnOrderBackward.onClick = event => {
      channel.send('Document:orderBackward', this.object);
    };

    this.btnOrderForward = new Button(this);
    this.btnOrderForward.title = 'Forward';
    this.btnOrderForward.onClick = event => {
      channel.send('Document:orderForward', this.object);
    };

    this.inputColor = new InputText(this);
    this.inputColor.value = this.object.color;
    this.inputColor.onChange = value => {
      this.object.setColor(value);
    };

    this.node.appendChild(this.btnOrderBack.render());
    this.node.appendChild(this.btnOrderFront.render());
    this.node.appendChild(this.btnOrderBackward.render());
    this.node.appendChild(this.btnOrderForward.render());
    this.node.appendChild(this.inputColor.render());
    return this.node;
  }
}

class PanelForTextBox extends PanelForShape {
  render() {
    super.render();
    this.node.appendChild(document.createTextNode("PanelForTextBox"));

    this.inputTextColor = new InputText(this);
    this.inputTextColor.value = this.object.textColor;
    this.inputTextColor.onChange = value => {
      this.object.setTextColor(value);
    };

    this.inputText = new InputText(this);
    this.inputText.value = this.object.text;
    this.inputText.onChange = value => {
      this.object.setText(value);
    };

    this.node.appendChild(this.inputTextColor.render());
    this.node.appendChild(this.inputText.render());
    return this.node;
  }
}

class PanelForImageList extends PanelForShape {
  render() {
    super.render();
    this.node.appendChild(document.createTextNode("PanelForImageList"));

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
        console.log(results);

        var item_height = randomInt(40, 60);
        var item_count = randomInt(10, 100);
        var item_start = randomInt(0, results.data.length - item_count);

        for(var i = item_start; i < item_start + item_count; i++) {
          var data = results.data[i];
          console.log(data);

          let node = document.createElement('img');
          node.className = 'vs-imagelistitem';
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

class TitleBar extends Window {
  constructor(...args) {
    super(...args);
    this.title = '';
  }

  setTitle(title) {
    this.title = title;
    if (this.node != null) {
      this.node.innerText = title;
    }
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-titlebar';
    this.node.innerText = this.title;
    return this.node;
  }
}

class Property extends Window {
  constructor(...args) {
    super(...args);
    this.titlebar = new TitleBar(this);
    this.titlebar.setTitle('Property');
    this.panel = new Panel(this);
    this.object = null;

    channel.bind(this, 'Property:setPanelFor', this.setPanelFor);
  }

  setPanelFor(object) {
    //console.log('SetPanel', object.name, object);
    this.panel.destruct();

    switch(object.name) {
      case 'ImageList':
        this.panel = new PanelForImageList(this);
        break;
      case 'TextBox':
        this.panel = new PanelForTextBox(this);
        break;
      case 'Page':
        this.panel = new PanelForPage(this);
        break;
      case 'Document':
        this.panel = new PanelForDocument(this);
        break;
    }
    this.panel.setObject(object);
    this.titlebar.setTitle(object.name + ' Property');
    this.node.appendChild(this.panel.render());
    return this.panel;
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-box';
    this.node.appendChild(this.titlebar.render());
    this.node.appendChild(this.panel.render());
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
