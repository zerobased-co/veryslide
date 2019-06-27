import View from './ui/View';
import List from '../core/List';
import channel from '../core/Channel';

class PageThumb extends View {
  constructor(state) {
    super({
      className: 'vs-pagethumb',
      width: 120,
      height: 80,
      page: null,
      thumbnail: null,
    }.update(state));

    this.node.addEventListener('click', () => {
      this.select();
    });

    channel.bind(this, 'PageThumb:deselect', () => {
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
    if (this.node == null) return;

    // check invalidation
    if (this.page.invalidate != true) return;
    this.page.invalidate = false;

    if (this.thumbnail != null) {
      this.node.removeChild(this.thumbnail);
    }

    const scale = this.width / this.page.width;
    this.thumbnail = this.page.node.cloneNode(true);
    this.thumbnail.classList.remove('vs-page');
    this.thumbnail.style.transform = 'scale(' + scale + ')';
    this.thumbnail.style.transformOrigin = 'top left';
    this.node.appendChild(this.thumbnail);
  }

  select() {
    channel.send('PageThumb:deselect');
    this.node.classList.toggle('focus');
    this.updateThumbnail();
    channel.send('Viewport:selectPage', this.page);
  }

  deselect() {
    this.node.classList.remove('focus');
  }

  clear() {
    super.clear();
    channel.unbind(this);
  }
}

class PageList extends View {
  constructor(state) {
    super({
      className: 'vs-pagelist',
    }.update(state));

    this.pagethumbs = new List();
    channel.bind(this, 'PageList:addPage', this.addPage);
    channel.bind(this, 'PageList:selectPage', this.selectPage);
    channel.bind(this, 'PageList:removePage', this.removePage);
  }

  addPage(page) {
    let pagethumb = this.pagethumbs.spawn(PageThumb);
    pagethumb.page = page;

    this.pagethumbs.append(pagethumb);
    this.appendChild(pagethumb);

    pagethumb.node.scrollIntoView();
    pagethumb.select();
  }

  selectPage(page) {
    let pagethumb = this.pagethumbs.findby((item) => {
      return item.page.order == page.order;
    });

    if (pagethumb !== null) {
      pagethumb.select();
      pagethumb.node.scrollIntoView();
    }
  }

  removePage(page) {
    let pagethumb = this.pagethumbs.findby((item) => {
      return item.page.order == page.order;
    });

    if (pagethumb !== null) {
      this.pagethumbs.remove(pagethumb);
      pagethumb.clear();
    }
  }
}

export default PageList
