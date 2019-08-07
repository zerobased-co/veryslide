import View, { Vertical, Horizon } from './View';

class Tab extends View {
  constructor(state) {
    super({
      className: 'vs-tab',
      title: '',
      tabIndex: 0,
      tabGroup: null,
      ...state,
    });

    this.node.addEventListener('click', this.onClick.bind(this));
  }

  activate(active) {
    if (active) {
      this.node.classList.add('active');
    } else {
      this.node.classList.remove('active');
    }
  }

  onClick(event) {
    this.tabGroup.selectTabAt(this.tabIndex);
  }

  on_title(text) {
    this.node.innerHTML = text;
  }
}

class TabGroup extends View {
  constructor(state) {
    super({
      className: 'vs-tabgroup',
      tabs: null,
      activeTab: null,
      ...state,
    });

  }

  selectTab(name) {
    if (this.tabs != null) {
      for(var i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i][0] == name) {
          this.selectTabAt(i);
          break;
        }
      }
    }
  }

  selectTabAt(index) {
    if (this.activeTab != null) {
      this.activeTab.activate(false);
    }

    const tab = this.tabs[index].tab;
    tab.activate(true);

    this.activeTab = tab;
    this.contentview.node.innerHTML = '';
    this.contentview.appendChild(this.tabs[index][1]);
  }

  render() {
    super.render();

    this.appendChild(new Vertical({children: [ 
      this.tabView = new Horizon(),
      this.contentview = new View(),
    ]}));

    if (this.tabs != null) {
      for(var i = 0; i < this.tabs.length; i++) {
        let data = this.tabs[i];
        let tab = new Tab({'title': data[0], tabGroup: this, tabIndex: i});
        this.tabs[i].tab = tab;
        this.tabView.appendChild(tab);
      }
    }
    this.selectTabAt(0);
  }
}

export { TabGroup, Tab }
