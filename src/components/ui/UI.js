import './UI.less';
import View, { Vertical, Horizon } from './View';
import Panel from './Panel';
import Button from './Button';
import TitleBar from './TitleBar';
import Text from './Text';
import InputText from './InputText';

class UI {
  constructor() {
    this.View = View;
    this.Vertical = Vertical;
    this.Horizon = Horizon;
    this.Panel = Panel;
    this.Button = Button;
    this.TitleBar = TitleBar;
    this.Text = Text;
    this.InputText = InputText;
  }

  /* shortcuts */
  createButton(parent, title, click) {
    return new Button({parent: parent, title: title, click: click});
  }
}

let ui = new UI();

export default ui
