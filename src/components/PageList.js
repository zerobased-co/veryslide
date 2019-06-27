import View from './ui/View';
import List from '../core/List';
import channel from '../core/Channel';

class PageThumb extends View {
  constructor(state) {
    super(state);
    this.pageInfo = null;

    channel.bind(this, 'PageThumb:deselect', () => {
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
    this.node.addEventListener('click', () => {
      this.select();
    });
    return this.node;
  }
}

class PageList extends View {
  constructor(state) {
    super(state);

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
      pagethumb.node.scrollIntoView();
    }
  }

  removePage(pageInfo) {
    let pagethumb = this.pagethumbs.findby((item) => {
      return item.pageInfo.order == pageInfo.order;
    });

    if (pagethumb !== null) {
      this.pagethumbs.remove(pagethumb);
      pagethumb.destruct();
    }
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-pagelist';
    return this.node;
  }
}

export default PageList
