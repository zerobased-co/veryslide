import View from './ui/View';
import List from 'core/List';
import channel from 'core/Channel';

class PageThumb extends View {
  constructor(state) {
    super({
      className: 'vs-pagethumb',
      width: 120,
      height: 80,
      page: null,
      img: null,
      ...state,
    });

    this.node.addEventListener('click', () => {
      this.select();
    });

    this.listen(this, 'PageThumb:deselect', () => {
      this.deselect();
    });
  }

  on_page(page) {
    if (page != null) {
      page.pagethumb = this;
      this.height = this.width / (page.width / page.height);
      this.updateThumbnail();
    }
  }

  on_width(width) {
    this.node.style.width = width + 'px';
  }

  on_height(height) {
    this.node.style.height = height + 'px';
  }

  updateThumbnail() {
    this.img.src = this.page.thumbnail;
  }

  select(smooth) {
    this.send('PageThumb:deselect');
    let behavior = smooth !== false ? 'smooth' : 'auto';
    this.node.scrollIntoView({behavior: behavior, block: 'nearest', inline: 'nearest'});
    this.node.classList.toggle('focus');
    this.send('Viewport:selectPage', this.page);
  }

  deselect() {
    this.node.classList.remove('focus');
  }

  render() {
    super.render();

    this.img = document.createElement('img');
    this.appendChild(this.img);
  }
}

class PageList extends View {
  constructor(state) {
    super({
      className: 'vs-pagelist',
      ...state,
    });

    this.pagethumbs = new List();
    this.listen(this, 'PageList:addPage', this.addPage);
    this.listen(this, 'PageList:selectPage', this.selectPage);
    this.listen(this, 'PageList:selectPageAt', this.selectPageAt);
    this.listen(this, 'PageList:removePage', this.removePage);
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


    pagethumb.node.scrollIntoView();
    return pagethumb;
  }

  selectPageAt(at, smooth) {
    let pagethumb = this.pagethumbs.at(at);

    if (pagethumb !== null) {
      pagethumb.select(smooth);
    }
  }

  selectPage(page, smooth) {
    if (page.pagethumb !== null) {
      page.pagethumb.select(smooth);
    }
  }

  removePage(page) {
    if (page.pagethumb !== null) {
      this.pagethumbs.remove(page.pagethumb);
      page.pagethumb.destroy();
    }
  }
}

export default PageList
