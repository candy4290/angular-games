import { CustomBlock, BlockMutator } from 'ngx-blockly';

declare var Blockly: any;

export class BooeanBlock extends CustomBlock {
  jsonBlock = {
    type: 'block_self_boolean',
    message0: '布尔值',
    inputsInline: false,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
  };

  constructor(type: string, block: any, blockMutator: BlockMutator, ...args: any[]) {
    super(type, block, blockMutator, ...args);
    this.class = BooeanBlock;
}

toXML() {
  return `<block type='${this.type}'></block>`;
}

toJavaScriptCode(e: any) {
  return null;
}

  defineBlock() {
    this.block.jsonInit(this.jsonBlock);
  }

}
