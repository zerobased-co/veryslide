import './UI.scss';
import List from '../../core/List.js';
import View, { Vertical, Horizon } from './View';
import Panel from './Panel';
import Button from './Button';
import HGroup from './HGroup';
import TitleBar from './TitleBar';
import Text from './Text';
import InputText from './InputText';
import CheckBox from './CheckBox';
import ColorButton from './ColorButton';
import Select from './Select';
import Filter from './Filter';

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
    this.CheckBox = CheckBox;
    this.ColorButton = ColorButton;
    this.Select = Select;
    this.Filter = Filter;
  }

  /* shortcuts */
  createText(title, className='vs-text-80') {
    return new Text({title, className});
  }

  createButton(title, onClick) {
    return new Button({title, onClick});
  }

  createInputText(object, property) {
    return new ui.InputText({
      value: object[property], 
      onChange: value => { object[property] = value },
    });
  }

  HGroup(...buttons) {
    return new HGroup({
      children: buttons,
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
