import { CustomBlock, BlockMutator } from 'ngx-blockly';

declare var Blockly: any;

export class PandaSetBlock extends CustomBlock {
    jsonBlock = {
      type: 'variables_set_panda',
      message0: '%{BKY_VARIABLES_SET}',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
          variableTypes: ['Panda'],
          defaultType: 'Panda'
        },
        {
          type: 'input_value',
          name: 'VALUE',
          check: 'Panda'    // Checks that the input value is of type 'Panda'
        }
      ],
      previousStatement: null,
      nextStatement: null,
    };

    constructor(type: string, block: any, blockMutator: BlockMutator, ...args: any[]) {
        super(type, block, blockMutator, ...args);
        this.class = PandaSetBlock;
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
