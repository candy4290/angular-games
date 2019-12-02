import Label from '../ngx-blockly/models/label';
// <button text="create Panda" callbackKey="createPanda"></button>
export class CustomLabel extends Label {
  constructor(text: string) {
    super(text);
  }
  public toXML(): string {
    return `<label text="${this.text}"></label>`;
  }
}
