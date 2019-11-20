import { CustomBlock, BlockMutator } from 'ngx-blockly';

declare var Blockly: any;

export class TestBlock extends CustomBlock {
    jsonBlock = {
      type: 'length of',
      message0: 'send email to %1', // %1指的是第一个参数
      args0: [
        {
          type: 'input_value',
          name: 'VALUE',
        }
      ],
      message1: 'subject %1',
      args1: [
        {
          type: 'input_value',
          name: 'VALUE',
        }
      ],
      message2: 'secure %1',
      args2: [
        {
          type: 'field_checkbox',
          name: 'VALUE',
          checked: true
        }
      ],
      message3: 'angle %1',
      args3: [
        {
          type: 'field_angle',
          name: 'FIELDNAME',
          angle: 90,
          ROUND: 70
        }
      ],
      message4: 'color: %1',
      args4: [
        {
          type: 'field_colour',
          name: 'xxx',
          colour: '#ff0000'
        }
      ],
      previousStatement: null, // 前面的连接块-不可与output一起使用, 连接到statement
      nextStatement: null, // 后面的连接块
      inputsInline: false, // 控制输入是否是内联
      // output: 'Number', // 前面凸起的部分，output 连接到 value input
      colour: 160,
      tooltip: 'Returns number of letters in the provided text.',
      helpUrl: 'http://www.w3schools.com/jsref/jsref_length_string.asp',
      // extensions: ['length of']
      // mutator: 'length of'
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
