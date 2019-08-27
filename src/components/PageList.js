import View from './ui/View';
import List from 'core/List';

class PageThumb extends View {
  constructor(state) {
    super({
      type: 'PageThumb',
      className: 'vs-pagethumb',
      width: 120,
      height: 80,
      page: null,
      selected: false,
      ...state,
    });

    this.node.addEventListener('click', (event) => {
      this.send('Controller:select', this.page, event.shiftKey);
    });
  }

  on_page(page) {
    if (page != null) {
      page.pagethumb = this;
      this.height = this.width / (page.width / page.height);
      if (page.thumbnail != '') {
        this.updateThumbnail();
      }
    }
  }

  on_width(width) {
    this.holder.style.width = width + 'px';
  }

  on_height(height) {
    this.holder.style.height = height + 'px';
  }

  updateThumbnail() {
    this.img.src = this.page.thumbnail;
    this.img.style.visibility = 'visible';
  }

  focus(focused, smooth) {
    super.focus(focused);

    if (focused) {
      let behavior = smooth !== false ? 'smooth' : 'auto';
      this.node.scrollIntoView({behavior: behavior, block: 'nearest', inline: 'nearest'});
      this.send('Viewport:focusPage', this.page);
    }
  }

  render() {
    super.render();

    this.holder = document.createElement('div');
    this.holder.className = 'holder';
    this.appendChild(this.holder);

    this.img = document.createElement('img');
    this.holder.appendChild(this.img);
  }
}

class PageList extends View {
  constructor(state) {
    super({
      className: 'vs-pagelist',
      ...state,
    });

    this.pagethumbs = new List();
    this.listen('PageList:addPage', this.addPage);
    this.listen('PageList:removePage', this.removePage);
  }

  addPage(page, at) {
    let pagethumb = new PageThumb();
    pagethumb.page = page;

    if (at == null) {
      this.pagethumbs.append(pagethumb);
      this.node.appendChild(pagethumb.node);
    } else {
      this.pagethumbs.insert(pagethumb, at);
      this.node.insertBefore(pagethumb.node, this.node.children[at]);
    }
    return pagethumb;
  }

  removePage(page) {
    if (page.pagethumb !== null) {
      this.pagethumbs.remove(page.pagethumb);
      page.pagethumb.destroy();
    }
  }
}

export default PageList
