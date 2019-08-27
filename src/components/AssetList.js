import State from 'core/State';
import View from './ui/View';
import ui from './ui/UI';

class AssetList extends View {
  constructor(state) {
    super({
      className: 'vs-assetlist',
      ...state,
    });

    this.listen('AssetList:addAsset', this.addAsset);
    this.listen('AssetList:removeAsset', this.removeAsset);
  }

  render() {
    super.render();
    this.node.className = 'vs-assetlist';
    return this.node;
  }

  addAsset(asset) {
    let assetItem = ui.H(
      ui.createText(asset.name),
      ui.createText(asset.assetType),
      ui.createButton('Update', () => { 
        asset.node.loading(true);
        asset.update();
      }),
      ui.createButton('Remove', () => { 
        this.send('Controller:removeAsset', asset);
        assetItem.node.remove();
      })
    );

    // Update asset
    asset.node = assetItem;
    if (asset.assetType !== 'URL') {
      asset.node.loading(true);
      asset.update();
    }

    this.loading(false);
    this.assetList.appendChild(assetItem);
  }

  removeAsset(asset) {
    this.loading(false);
  }

  onAddAsset() {
    this.loading(true);
    this.send('Controller:addAsset', 'URL', this.inputName.value, this.inputUrl.value);
    this.inputName.value = '';
    this.inputUrl.value = '';
  }

  render() {
    super.render();

    [
      ui.P(
        new ui.TitleBar({'title': 'Add new asset'}),
        ui.V(
          ui.H(
            ui.createText('Name'),
            this.inputName = new ui.InputText(),
          ),
          ui.HGroup(
            ui.createText('URL'),
            this.inputUrl = new ui.InputText(),
            ui.createButton('Add', () => { this.onAddAsset(); }),
          ),
          ui.HGroup(
            ui.createText('File'),
            this.inputFile = new ui.InputFile(),
          ),
        ),
        new ui.TitleBar({'title': 'Asset list'}),
        this.assetList = ui.V(),
      ),
    ].forEach(item => this.appendChild(item));

    this.inputFile.onChange = (file) => {
      this.loading(true);
      this.send('Controller:addAsset', 'FILE', this.inputName.value, file);
      this.inputName.value = '';
      this.inputFile.reset();
    }
  }
}

export default AssetList;
