import { CustomBlock, BlockMutator } from 'ngx-blockly';

declare var Blockly: any;

export class ClickDrivenBlock extends CustomBlock {
    jsonBlock = {
      type: 'block_click_driven',
      message0: '点击触发 %1 %2',
      args0: [
        {
          type: 'input_dummy'
        },
        {
          type: 'input_statement',
          name: 'NAME'
        }
      ],
      inputsInline: false,
      colour: 230,
      tooltip: '',
      helpUrl: '',
      hat: 'cap'
    };

    constructor(type: string, block: any, blockMutator: BlockMutator, ...args: any[]) {
        super(type, block, blockMutator, ...args);
        this.class = ClickDrivenBlock;
    }

    defineBlock() {
      this.block.jsonInit(this.jsonBlock);
    }

    toXML() {
        return `<block type='${this.type}'></block>`;
    }

    toJavaScriptCode(e: any) {
      return '打死你';
    }

    onChange(changeEvent: any) {
        console.log(changeEvent);
    }
}
