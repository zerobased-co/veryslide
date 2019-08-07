import State from '../core/State.js';
import View from './ui/View';
import ui from './ui/UI';

class Asset extends State {
  constructor(state) {
    super({
      type: 'Asset',
      name: '',
      data: '',
    });
  }
}

class AssetList extends View {
  constructor(state) {
    super({
      className: 'vs-assetlist',
      ...state,
    });
  }

  render() {
    super.render();
    this.node.className = 'vs-assetlist';
    return this.node;
  }

  addSet() {
    this.inputName.value = '';
    this.inputUrl.value = '';
  }

  render() {
    super.render();

    [
      ui.P(
        new ui.TitleBar({'title': 'Add new asset'}),
        ui.HGroup(
          this.inputName = new ui.InputText(),
          this.inputUrl = new ui.InputText(),
          ui.createButton('Add', () => { this.addSet(); }),
        ),
        new ui.TitleBar({'title': 'Asset list'}),
        this.assetList = ui.V(),
      ),
    ].forEach(item => this.appendChild(item));
  }
}

export { Asset, AssetList }
