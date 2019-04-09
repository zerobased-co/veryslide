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
    this.pages = new List(Page);
    channel.bind(this, null, 'addPage:done', this.addPage);
  }

  addPage(pageInfo) {
    let page = this.pages.spawn();
    page.pageInfo = pageInfo;
    this.pages.append(page);

    this.node.append(page.render());
    page.node.scrollIntoView();
    page.select();
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
}

class Page extends Window {
  constructor(...args) {
    super(...args);
    this.pageInfo = null;

    channel.bind(this, 'Page', 'deselect', function(that) {
      return function(value) {
        that.deselect();
      }
    }(this));
  }

  select() {
    channel.send('Page', 'deselect', null);
    this.node.classList.toggle('vs-page-focus');
    channel.send('Viewport', 'selectPage', this.pageInfo);
  }

  deselect() {
    this.node.classList.remove('vs-page-focus');
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-page';
    this.node.addEventListener('click', function(that) {
      return function(e) {
        that.select();
      }
    }(this));
    return this.node;
  }
}

class Navigator extends Window {
  constructor(...args) {
    super(...args);
    this.pagelist = new PageList(this);

    this.addPageButton = new Button(this);
    this.addPageButton.title = 'Add a page';
    this.addPageButton.className = 'vs-button';
    this.addPageButton.click = function(that) {
      return function(e) {
        channel.send('Document', 'addPage', null);
      }
    }(this);
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-navigator';

    this.node.appendChild(this.pagelist.render());
    this.node.appendChild(this.addPageButton.render());
    return this.node;
  }
}

class Viewport extends Window {
  constructor(...args) {
    super(...args);
    channel.bind(this, 'Viewport', 'selectPage', this.selectPage);
  }

  selectPage(pageInfo) {
    console.log(pageInfo);
    this.node.innerHTML = pageInfo.number;
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-viewport';
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

class Editor {
  constructor() {
    this.navigator = new Navigator(this);
    this.viewport = new Viewport(this);
    this.toolbox = new ToolBox(this);
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-editor';
    this.node.appendChild(this.navigator.render());
    this.node.appendChild(this.viewport.render());
    this.node.appendChild(this.toolbox.render());
    return this.node;
  }
}

export default Editor
