import { Block} from 'ngx-blockly';
export default abstract class Label extends Block {
  private _text: string;

  constructor(text: string) {
    super(null);
    this._text = text;
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
  }


  public abstract toXML();

}
