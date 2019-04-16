import List from '../core/list';
import channel from '../core/channel';

class Window {
  construct(parent) {
    this.parent = parent;
    this.node = null;
  }

  render() {
    this.node = document.createElement('div');
    return this.node;
  }
}

class PageList extends Window {
  constructor(...args) {
    super(...args);
    this.pages = new List(PageThumb);
    channel.bind(this, null, 'addPage:done', this.addPage);
  }

  addPage(pageInfo) {
    let pagethumb = this.pages.spawn(this);
    pagethumb.pageInfo = pageInfo;
    this.pages.append(pagethumb);

    this.node.append(pagethumb.render());
    pagethumb.node.scrollIntoView();
    pagethumb.select();
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
      channel.send('Document', 'addPage', null);
    };

    this.btnZoom = new Button(this);
    this.btnZoom.title = 'Reset zoom';
    this.btnZoom.click = event => {
      channel.send('Viewport', 'zoom', 1.0);
    };
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-menu';

    this.node.appendChild(this.btnAddPage.render());
    this.node.appendChild(this.btnZoom.render());
    return this.node;
  }
}

class PageThumb extends Window {
  constructor(...args) {
    super(...args);
    this.pageInfo = null;

    channel.bind(this, 'PageThumb', 'deselect', value => {
      this.deselect();
    });
  }

  select() {
    channel.send('PageThumb', 'deselect', null);
    this.node.classList.toggle('focus');
    channel.send('Viewport', 'selectPage', this.pageInfo);
  }

  deselect() {
    this.node.classList.remove('focus');
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
  }

  setup(pageInfo) {
    this.node.style.width = pageInfo.width + "px";
    this.node.style.height = pageInfo.height + "px";
    this.node.innerHTML = pageInfo.number;
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-page';
    return this.node;
  }
}

class Viewport extends Window {
  constructor(...args) {
    super(...args);
    this.page = null;

    this.scrollX = 0;
    this.scrollY = 0;
    this.grab = false;
    this.drag = false;
    this.dragStart = undefined;
    this.translate = {x: 0, y: 0};
    this.scale = 1.0;
    //this.zoomLevel = [10, 25, 50, 75, 100, 200, 400];

    channel.bind(this, 'Viewport', 'selectPage', this.selectPage);
    channel.bind(this, 'Viewport', 'zoom', this.zoom);
  }

  selectPage(pageInfo) {
    if (this.page !== undefined) {
      this.node.innerHTML = '';
      delete this.page;
    }
    this.page = new Page(this);
    this.node.append(this.page.render());
    this.page.setup(pageInfo);
    this.update();
  }

  update() {
    this.page.node.style.transform = 'translate(' + this.translate.x + 'px, ' + this.translate.y + 'px) scale(' + this.scale + ')';
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

    this.node.addEventListener('keydown', event => {
      if (event.keyCode === 32) {
        event.preventDefault();
        if (this.grab === false) {
          this.node.style.cursor = 'grab';
          this.grab = true;
        }
      }

      if (event.keyCode === 189) {
        this.zoomOut();
      }

      if (event.keyCode === 187) {
        this.zoomIn();
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
      if (this.drag === true && this.page !== undefined) {
        console.log('dragging');
        let dx = event.clientX - this.dragStart.x;
        let dy = event.clientY - this.dragStart.y;
        console.log(dx, dy);

        this.translate.x = dx;
        this.translate.y = dy;
        this.update();
      }
    });

    this.node.addEventListener('mousedown', event => {
      console.log('mousedown');
      if (this.grab === true && this.page !== undefined) {
        this.node.style.cursor = 'grabbing';
        this.drag = true;
        this.dragStart = {
          x: event.clientX - parseInt(this.translate.x),
          y: event.clientY - parseInt(this.translate.y),
        }
      }
    });

    this.node.addEventListener('mouseup', event => {
      console.log('mouseup');
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

    return this.node;
  }
}

class Property extends Window {
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

    return this.node;
  }
}

export default Editor
