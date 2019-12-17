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
          type: 'input_dummy',
          name: 'INPUT'
        }],
      inputsInline: false,
      output: args[1],
      // colour: args[2] || 230,
      style: 'text_blocks',
      tooltip: '',
      helpUrl: '',
      extensions: [args[0]]
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
    return [e.getFieldValue('NAME'), Blockly.JavaScript.ORDER_NONE];
  }

}
