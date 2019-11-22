import Button from '../ngx-blockly/models/button';
// <button text="create Panda" callbackKey="createPanda"></button>
export class CreateVariableButton extends Button {
  constructor(text: string, callbackKey: string) {
    super(text, callbackKey);
  }
  public toXML(): string {
    return `<button text="${this.text}" callbackKey="${this.callbackKey}"></button>`;
  }
}
