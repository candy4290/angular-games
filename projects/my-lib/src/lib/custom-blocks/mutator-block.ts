import { CustomBlock, BlockMutator } from 'ngx-blockly';

declare var Blockly: any;

export class MutatorBlock extends CustomBlock {
  jsonBlock = {
    "type": "block_self_mutator",
    "message0": "%1",
    "args0": [
      {
        "type": "input_statement",
        "name": "NAME",
        "check": "Boolean"
      }
    ],
    "colour": 230,
    "tooltip": "",
  };

  constructor(type: string, block: any, blockMutator: BlockMutator, ...args: any[]) {
    super(type, block, blockMutator, ...args);
    this.class = MutatorBlock;
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
