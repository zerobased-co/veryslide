import ui from './ui/UI';
import View from './ui/View';
import Panel from './ui/Panel';
import channel from 'core/Channel';

const FONTLIST = [
  ['serif', 'Serif'],
  ['sans-serif', 'Sans serif'],
  ['monospace', 'Monospace'],
  ['', '----'],
  ['Inconsolata'],
  ['Lato'],
  ['Merriweather'],
  ['Montserrat'],
  ['Open Sans'],
  ['Roboto'],
  ['', '----'],
  ['Noto Sans KR', '노토 산스'],
  ['Nanum Gothic', '나눔 고딕'],
  ['Nanum Myeongjo', '나눔 명조'],
];

class PanelForDocument extends Panel {
  render() {
    super.render();
    this.appendChild(ui.createText('PanelForDocument'));
    return this.node;
  }
}

class PanelForPage extends Panel {
  render() {
    super.render();
    [
      new ui.TitleBar({'title': 'Page style'}),
      ui.H(
        ui.createText('Background'),
        new ui.ColorButton().pair(this.object, 'color'),
      ),
    ].forEach(item => this.appendChild(item));
    return this.node;
  }
}

class PanelForBox extends Panel {
  render() {
    super.render();
    [
      new ui.TitleBar({'title': 'Object style'}),
      ui.H(
        ui.createText('Object'),
        ui.V(
          ui.H(
            ui.createText('Position'),
            ui.createInputText(this.object, 'x'),
            ui.createInputText(this.object, 'y'),
          ),
          ui.H(
            ui.createText('Size'),
            ui.createInputText(this.object, 'width'),
            ui.createInputText(this.object, 'height'),
          ),
        ),
      ),
      ui.H(
        ui.createText('Order'),
        new ui.Vertical({children: [
          ui.HGroup(
            ui.createButton('Back', () => { this.send('Controller:order', this.object, 'back'); }),
            ui.createButton('Front', () => { this.send('Controller:order', this.object, 'front'); }),
          ),
          ui.HGroup(
            ui.createButton('Backward', () => { this.send('Controller:order', this.object, 'backward'); }),
            ui.createButton('Forward', () => { this.send('Controller:order', this.object, 'forward'); }),
          ),
        ]}),
      ),
      ui.H(
        ui.createText('Vertical'),
        ui.HGroup(
          ui.createButton('Top', () => { this.send('Controller:align', this.object, 'top'); }),
          ui.createButton('Middle', () => { this.send('Controller:align', this.object, 'middle'); }),
          ui.createButton('Bottom', () => { this.send('Controller:align', this.object, 'bottom'); }),
        ),
      ),
      ui.H(
        ui.createText('Horizon'),
        ui.HGroup(
          ui.createButton('Left', () => { this.send('Controller:align', this.object, 'left'); }),
          ui.createButton('Center', () => { this.send('Controller:align', this.object, 'center'); }),
          ui.createButton('Right', () => { this.send('Controller:align', this.object, 'right'); }),
        ),
      ),

      ui.H(
        ui.createText('Background'),
        new ui.ColorButton().pair(this.object, 'color'),
      ),

      ui.H(
        ui.createText('Border'),
        new ui.Select({
          options: [['none', '----'], ['solid', 'Solid'], ['dashed', 'Dashed']],
        }).pair(this.object, 'borderStyle'),
        new ui.InputText().pair(this.object, 'borderWidth'),
        new ui.ColorButton().pair(this.object, 'borderColor'),
      ),

      ui.H(
        ui.createText('Opacity'),
        new ui.InputText().pair(this.object, 'opacity'),
      ),

      ui.H(
        ui.createText('Padding'),
        new ui.InputText().pair(this.object, 'padding'),
      ),
    ].forEach(item => this.appendChild(item));
    return this.node;
  }
}

class PanelForTextBox extends PanelForBox {
  render() {
    super.render();

    [
      new ui.TitleBar({'title': 'Text style'}),
      ui.H(
        ui.createText('Color'),
        new ui.ColorButton().pair(this.object, 'textColor'),
      ),

      ui.H(
        ui.createText('Font'),
        new ui.InputText().pair(this.object, 'size'),
        new ui.Select({
          options: FONTLIST,
        }).pair(this.object, 'fontFamily'),
      ),

      ui.H(
        ui.createText('Style'),
        new ui.CheckBox({
          title: 'Bold',
        }).pair(this.object, 'bold'),
        new ui.CheckBox({
          title: 'Italic',
        }).pair(this.object, 'italic'),
        new ui.CheckBox({
          title: 'Underline',
        }).pair(this.object, 'underline'),
      ),

      ui.H(
        ui.createText('Word Break'),
        new ui.Select({
          options: [['normal', 'Normal'], ['break-all', 'Break All'], ['keep-all', 'Keep All'], ['break-word', 'Break Word']],
        }).pair(this.object, 'wordBreak'),
      ),

      ui.H(
        ui.createText('Alignment'),
        new ui.Select({
          options: [['left', 'Left'], ['center', 'Center'], ['right', 'Right']],
        }).pair(this.object, 'align'),
        new ui.Select({
          options: [['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom']],
        }).pair(this.object, 'verticalAlign'),
      ),
    ].forEach(item => this.appendChild(item));

    return this.node;
  }
}

class PanelForImageBox extends PanelForBox {
  render() {
    super.render();

    // TBD: We cannot change image after creation
    [
      new ui.TitleBar({'title': 'Image'}),
      ui.H(
        ui.createText('Reset'),
        ui.createButton('Original size', () => { 
          this.object.resetSize();
        }),
      ),
    ].forEach(item => this.appendChild(item));

    return this.node;
  }
}

class PanelForImageList extends PanelForBox {
  render() {
    super.render();

    if (this.object.items.length == 0) {
      this.object.update();
    }

    this.assets = this.send('Controller:getAssetList')[0];
    this.dataOptions = [['', '----']].concat(this.assets.array.map(x => [x.name, x.name]));

    [
      new ui.TitleBar({title: 'List Property'}),
      ui.H(
        ui.createText('Data Asset'),
        new ui.Select({
          options: this.dataOptions,
          onChange: (value) => { 
            super.onChange(value);
            this.send('Property:setPanelFor', this.object);
          },
        }).pair(this.object, 'asset'),
        ui.createText(
          '&nbsp;' + this.object.selectedItems.length + ' of ' + this.object.items.length + ' Item(s)',
          'vs-text-140',
        ),
      ),

      ui.H(
        ui.createText('Image Base'),
        new ui.Select({
          options: this.dataOptions,
        }).pair(this.object, 'imageBase'),
      ),

      ui.H(
        ui.createText('Control'),
        ui.HGroup(
          ui.createButton('Clear', () => { this.object.clear(); }),
          ui.createButton('Shuffle', () => { this.object.shuffle(); }),
          ui.createButton('Apply', () => { this.object.apply(); this.send('Property:setPanelFor', this.object); }),
        ),
      ),

      ui.H(
        ui.createText('Icon'),
        ui.V(
          ui.H(
            ui.createText('Size'),
            new ui.InputText().pair(this.object, 'itemMaxWidth'),
            new ui.InputText().pair(this.object, 'itemMaxHeight'),
          ),
          ui.H(
            ui.createText('Margin'),
            new ui.InputText().pair(this.object, 'itemMargin'),
          ),
          ui.H(
            ui.createText('Arrange'),
            new ui.Select({
              options: [['row', 'Row'], ['column', 'Column']],
            }).pair(this.object, 'itemDirection'),

            new ui.Select({
              options: [
                ['flex-start', 'Left'],
                ['center', 'Center'],
                ['flex-end', 'Right'],
                ['space-between', 'Justify'],
                ['space-around', 'Around'],
                ['space-evenly', 'Evenly']
              ],
            }).pair(this.object, 'itemAlign'),
          ),
        ),
      ),

      new ui.TitleBar({title: 'Filter'}),
      new ui.Filter({
        fields: this.object.fields,
        items: this.object.items,
        filter: this.object.filter,
        onChange: value => { this.object.filter = value },
      }),
    ].forEach(item => this.appendChild(item));

    return this.node;
  }
}

class Property extends View {
  constructor(state) {
    super({
      className: 'vs-property',
      object: null,
      ...state,
    });

    this.listen(this, 'Property:setPanelFor', this.setPanelFor);
  }

  setPanelFor(object) {
    this.panel.destroy();
    delete this.panel;

    switch(object.type) {
      case 'ImageList':
        this.panel = new PanelForImageList({object});
        break;
      case 'ImageBox':
        this.panel = new PanelForImageBox({object});
        break;
      case 'TextBox':
        this.panel = new PanelForTextBox({object});
        break;
      case 'Page':
        this.panel = new PanelForPage({object});
        break;
      case 'Document':
        this.panel = new PanelForDocument({object});
        break;
    }
    this.appendChild(this.panel);

    this.send('ToolBox:activeTab', 'Property');
    return this.panel;
  }

  render() {
    super.render();

    this.panel = new ui.Panel();

    this.appendChild(this.panel);
    return this.node;
  }
}

export default Property;
