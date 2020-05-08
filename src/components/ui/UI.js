import './UI.scss';
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
import Separator from './Separator';
import Slider from './Slider';
import TextSlider from './TextSlider';
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
    this.Separator = Separator;
    this.Slider = Slider;
    this.TextSlider = TextSlider;
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

  createReadOnly(target, property) {
    return new Text().pair(target, property);
  }

  createInputText(target, property) {
    return new InputText().pair(target, property);
  }

  HGroup(...children) {
    return new HGroup({
      children,
    });
  }

  P(...children) {
    return new Panel({
      children,
    });
  }

  H(...children) {
    return new Horizon({
      children,
    });
  }

  HE(...children) {
    return new Horizon({
      className: 'vs-horizon-end',
      children,
    });
  }

  V(...children) {
    return new Vertical({
      children,
    });
  }
}

let ui = new UI();

export default ui
