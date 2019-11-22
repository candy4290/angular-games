import { Block} from 'ngx-blockly';
export default abstract class Button extends Block {
  private _text: string;
  private _callbackKey: string;

  constructor(text: string, callbackKey: string) {
    super(null);
    this._text = text;
    this._callbackKey = callbackKey;
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
  }

  get callbackKey(): string {
    return this._callbackKey;
  }

  set callbackKey(value: string) {
    this._callbackKey = value;
  }

  public abstract toXML();

}
