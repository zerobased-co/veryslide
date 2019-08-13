import './UI.scss';
import List from '../../core/List.js';
import View, { Vertical, Horizon } from './View';
import Panel from './Panel';
import Button from './Button';
import HGroup from './HGroup';
import TitleBar from './TitleBar';
import Text from './Text';
import InputText from './InputText';
import InputFile from './InputFile';
import CheckBox from './CheckBox';
import ColorButton from './ColorButton';
import Select from './Select';
import Filter from './Filter';
import { Tab, TabGroup } from './Tab';

class UI {
  constructor() {
    /* connote UI classes for convenience*/
    this.View = View;
    this.Vertical = Vertical;
    this.Horizon = Horizon;
    this.Panel = Panel;
    this.Button = Button;
    this.TitleBar = TitleBar;
    this.Text = Text;
    this.InputText = InputText;
    this.InputFile = InputFile;
    this.CheckBox = CheckBox;
    this.ColorButton = ColorButton;
    this.Select = Select;
    this.Filter = Filter;
    this.Tab = Tab;
    this.TabGroup = TabGroup;
  }

  /* shortcuts */
  createText(title, className='vs-text-80') {
    return new Text({title, className});
  }

  createButton(title, onClick, className='vs-button') {
    return new Button({title, onClick, className});
  }

  createInputText(target, property) {
    return new ui.InputText().bind(target, property);
  }

  HGroup(...buttons) {
    return new HGroup({
      children: buttons,
    });
  }

  P(...children) {
    return new Panel({
      children: children,
    });
  }

  H(...children) {
    return new Horizon({
      children: children,
    });
  }

  V(...children) {
    return new Vertical({
      children: children,
    });
  }
}

let ui = new UI();

export default ui
