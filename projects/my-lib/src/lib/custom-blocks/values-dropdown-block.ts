import { CustomBlock, BlockMutator } from 'ngx-blockly';
declare var Blockly: any;
export class ValuesDropDownBlock extends CustomBlock {
  jsonBlock = {};
  constructor(type: string, block: any, blockMutator: BlockMutator, ...args: any[]) {
    super(type, block, blockMutator, ...args);
    this.jsonBlock = {
      type: this.type,
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [
            [
              '请选择',
              'null'
            ],
            [
              '常住人口',
              '常住人口1'
            ],
            [
              '暂住人口',
              '暂住人口1'
            ]
          ]
        }
      ],
      inputsInline: false,
      output: null,
      colour: 230,
      tooltip: '',
      helpUrl: ''
    };
    this.class = ValuesDropDownBlock;
  }

  defineBlock() {
    this.block.jsonInit(this.jsonBlock);
  }

  toXML() {
      return `<block type='${this.type}'></block>`;
  }

  toJavaScriptCode(e: any) {
    return [e.getFieldValue('NAME'), Blockly.JavaScript.ORDER_NONE];
  }

}
