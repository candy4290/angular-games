import { CustomBlock, BlockMutator } from 'ngx-blockly';

declare var Blockly: any;

export class TestBlock extends CustomBlock {
    jsonBlock = {
        "type": "selt_block_and",
        "message0": "且 %1 %2",
        "args0": [
          {
            "type": "input_dummy"
          },
          {
            "type": "input_statement",
            "name": "NAME",
            "check": "Boolean"
          }
        ],
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""
    };

    constructor(type: string, block: any, blockMutator: BlockMutator, ...args: any[]) {
        super(type, block, blockMutator, ...args);
        this.class = TestBlock;
    }

    defineBlock() {
      this.block.jsonInit(this.jsonBlock);
      // this.block.appendValueInput('VALUE')
      //     .appendField(this.type);
      // this.block.setOutput(true, 'Number');
      // this.block.setColour(30);
      // this.block.setTooltip('hhd');
      // this.block.setHelpUrl('http://www.w3schools.com/jsref/jsref_length_string.asp');
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
