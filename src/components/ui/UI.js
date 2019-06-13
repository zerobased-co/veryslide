import Window, { Row, Col } from './Window';
import Panel from './Panel';
import Button from './Button';
import TitleBar from './TitleBar';
import Text from './Text';
import InputText from './InputText';

class UI {
  constructor() {
    this.Window = Window;
    this.Row = Row;
    this.Col = Col;
    this.TitleBar = TitleBar;
    this.Panel = Panel;
    this.Button = Button;
    this.Text = Text;
    this.InputText = InputText;
  }

  newButton(parent, title, callback) {
    let button = new Button(parent);
    button.setTitle(title);
    button.onClick = callback;
    return button;
  }
}

let ui = new UI();

export default ui
