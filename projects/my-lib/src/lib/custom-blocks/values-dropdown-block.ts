import { CustomBlock, BlockMutator } from 'ngx-blockly';
declare var Blockly: any;
export class ValuesDropDownBlock extends CustomBlock {
  jsonBlock = {};
  constructor(type: string, block: any, blockMutator: BlockMutator, ...args: any[]) {
    super(type, block, blockMutator, ...args);
    this.jsonBlock = {
      type: this.type,
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [
          ]
        }
      ],
      inputsInline: false,
      output: null,
      colour: 230,
      tooltip: '',
      helpUrl: ''
    };
    this.class = ValuesDropDownBlock;
  }

  defineBlock() {
    this.block.jsonInit(this.jsonBlock);
  }

  toXML() {
      return `<block type='${this.type}'></block>`;
  }

  toJavaScriptCode(e: any) {
    return [this.args[0], Blockly.JavaScript.ORDER_NONE];
  }

}
