import { CustomBlock, BlockMutator } from 'ngx-blockly';

declare var Blockly: any;

export class VariableGetBlock extends CustomBlock {
    jsonBlock = {};

    constructor(type: string, block: any, blockMutator: BlockMutator, ...args: any[]) {
      super(type, block, blockMutator, ...args);
      this.jsonBlock = {
        type,
        message0: '%1',
        args0: [
          {
            type: 'field_variable',
            name: 'VAR',
            variable: args[0] || 'item',
            variableTypes: [args[1]],    // Specifies what types to put in the dropdown
            defaultType: args[1]
          }
        ],
        style: 'variable_blocks',
        // colour: args[2] || '%{BKY_VARIABLES_HUE}',
        // tooltip: `类型为：${args[1]}`,
        output: args[1],    // Returns a value of 'Panda'
      };
      this.class = VariableGetBlock;
    }

    defineBlock() {
      this.block.jsonInit(this.jsonBlock);
    }

    toXML() {
        return `<block type='${this.type}'></block>`;
    }

    toJavaScriptCode(e: any) {
      return [this.args[0], Blockly.JavaScript.ORDER_ATOMIC];
    }
}
