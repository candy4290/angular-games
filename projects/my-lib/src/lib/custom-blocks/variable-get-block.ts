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
          variableTypes: ['Panda']    // Specifies what types to put in the dropdown
        }
      ],
      output: 'Panda',    // Returns a value of 'Panda'
      // previousStatement: null, // 前面的连接块-不可与output一起使用, 连接到statement
      // nextStatement: null, // 后面的连接块
      // inputsInline: false, // 控制输入是否是内联
      // output: 'Number', // 前面凸起的部分，output 连接到 value input
      colour: 160,
      // tooltip: 'Returns number of letters in the provided text.',
      // helpUrl: 'http://www.w3schools.com/jsref/jsref_length_string.asp',
      // extensions: ['length of']
      // mutator: 'length of'
    };

    constructor(type: string, block: any, blockMutator: BlockMutator, ...args: any[]) {
        super(type, block, blockMutator, ...args);
        this.class = PandaGetBlock;
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
