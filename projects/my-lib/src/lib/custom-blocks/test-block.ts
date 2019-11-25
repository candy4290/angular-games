import { CustomBlock, BlockMutator } from 'ngx-blockly';

declare var Blockly: any;

export class TestBlock extends CustomBlock {
    jsonBlock ={
      "type": "block_self_add",
      "message0": "%1 %2 %3 %4",
      "args0": [
        {
          "type": "input_value",
          "name": "NAME1"
        },
        {
          "type": "field_dropdown",
          "name": "NAME",
          "options": [
            [
              "且",
              "and"
            ],
            [
              "或",
              "or"
            ]
          ]
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_value",
          "name": "NAME2"
        }
      ],
      mutator: 'blockly_self_add_mutator',
      "inputsInline": false,
      "output": "Boolean",
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
      Blockly.BlockSvg.START_HAT = true;
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
      const valueName1 = Blockly.JavaScript.valueToCode(e, 'NAME1', Blockly.JavaScript.ORDER_ATOMIC);
      const dropdownName = e.getFieldValue('NAME');
      const valueName2 = Blockly.JavaScript.valueToCode(e, 'NAME2', Blockly.JavaScript.ORDER_ATOMIC);
      const temp = valueName1 + dropdownName +  valueName2;
      // TODO: Assemble JavaScript into code variable.
      const code = temp;
      console.log(code);
      // TODO: Change ORDER_NONE to the correct strength.
      return [code, Blockly.JavaScript.ORDER_NONE];
    }

    onChange(changeEvent: any) {
        // console.log(changeEvent);
    }

}
