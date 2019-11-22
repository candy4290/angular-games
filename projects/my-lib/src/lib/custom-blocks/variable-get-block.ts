import { CustomBlock, BlockMutator } from 'ngx-blockly';

declare var Blockly: any;

export class PandaGetBlock extends CustomBlock {
    jsonBlock = {
      type: 'variables_get_panda',
      message0: '%1',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
          variableTypes: ['Panda'],    // Specifies what types to put in the dropdown
          defaultType: 'Panda'
        }
      ],
      output: 'Panda',    // Returns a value of 'Panda'
    };

    constructor(type: string, block: any, blockMutator: BlockMutator, ...args: any[]) {
        super(type, block, blockMutator, ...args);
        this.class = PandaGetBlock;
    }

    defineBlock() {
      this.block.jsonInit(this.jsonBlock);
    }

    toXML() {
        return `<block type='${this.type}'></block>`;
    }

    toJavaScriptCode(e: any) {
      console.log(this.block.getFieldValue('END'));
      console.log(this.args);
      return '打死你';
    }

    onChange(changeEvent: any) {
        console.log(changeEvent);
    }
}
