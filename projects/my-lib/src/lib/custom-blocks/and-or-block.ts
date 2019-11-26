import { CustomBlock, BlockMutator } from 'ngx-blockly';

declare var Blockly: any;

export class TestBlock extends CustomBlock {
    jsonBlock ={
      type: 'block_self_add',
      message0: '%1 %2 %3',
      args0: [
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [
            [
              '且',
              '&&'
            ],
            [
              '或',
              '||'
            ]
          ]
        },
        {
          type: 'input_value',
          name: 'NAME1',
          check: 'Boolean'
        },
        {
          type: 'input_value',
          name: 'NAME2',
          check: 'Boolean'
        }
      ],
      mutator: 'blockly_self_add_mutator',
      inputsInline: false,
      output: 'Boolean',
      colour: 230,
      tooltip: '',
      helpUrl: ''
    };

    constructor(type: string, block: any, blockMutator: BlockMutator, ...args: any[]) {
        super(type, block, blockMutator, ...args);
        this.class = TestBlock;
    }

    defineBlock() {
      this.block.jsonInit(this.jsonBlock);
      this.block.setMutator(new Blockly.Mutator(['block_self_boolean']));
      // Blockly.BlockSvg.START_HAT = true;
    }

    toXML() {
        return `<block type='${this.type}'></block>`;
    }

    toJavaScriptCode(e: any) {
      const inputList = this.block.inputList;
      const dropdownName = e.getFieldValue('NAME');
      let code = '';
      for (let i = 1; i <= inputList.length; i++) {
        const temp = Blockly.JavaScript.valueToCode(e, `NAME${i}`, Blockly.JavaScript.ORDER_ATOMIC);
        if (i < inputList.length) {
          code +=  (temp + dropdownName);
        } else {
          code += temp;
        }
      }
      // TODO: Change ORDER_NONE to the correct strength.
      return [code, Blockly.JavaScript.ORDER_NONE];
    }

    onChange(changeEvent: any) {
        // console.log(changeEvent);
    }

}
