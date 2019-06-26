import './UI.scss';
import View, { Vertical, Horizon } from './View';
import Panel from './Panel';
import Button from './Button';
import TitleBar from './TitleBar';
import Text from './Text';
import InputText from './InputText';
import CheckBox from './CheckBox';
import ColorButton from './ColorButton';

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
  }

  /* shortcuts */
  createText(parent, title) {
    return new Text({parent, title});
  }
  createButton(parent, title, onClick) {
    return new Button({parent, title, onClick});
  }
}

let ui = new UI();

export default ui
