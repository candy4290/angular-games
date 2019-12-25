import { CustomBlock, BlockMutator } from 'ngx-blockly';
declare var Blockly: any;

export class AndOrBlock extends CustomBlock {
  jsonBlock = {
    type: 'logic_block_self_add',
    message0: '%1 %2 %3',
    args0: [
      {
        type: 'field_dropdown',
        name: 'NAME',
        options: [
          ['且', 'AND'],
          ['或', 'OR']
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
    style: 'logic_blocks',
    tooltip: '',
    helpUrl: ''
  };

  constructor(
    type: string,
    block: any,
    blockMutator: BlockMutator,
    ...args: any[]
  ) {
    super(type, block, blockMutator, ...args);
    this.class = AndOrBlock;
  }

  defineBlock() {
    this.block.jsonInit(this.jsonBlock);
  }

  toXML() {
    return `<block type='${this.type}'>
          <mutation items="2"></mutation>
          <field name="NAME">AND</field>
        </block>`;
  }

  toJavaScriptCode(e: any) {
    const inputList = this.block.inputList;
    const dropdownName = e.getFieldValue('NAME') === 'AND' ? '&&' : '||';
    let code = '';
    for (let i = 1; i <= inputList.length; i++) {
      const temp = Blockly.JavaScript.valueToCode(
        e,
        `NAME${i}`,
        Blockly.JavaScript.ORDER_ATOMIC
      );
      if (i < inputList.length) {
        code += temp + dropdownName;
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

  /**
   * 加载mutator中使用到的block,这些block不需要转化为代码，只是用来构造source block的结构（例如增删inputs数量）
   */
  loadBlockInMutator() {
    // tslint:disable-next-line: no-string-literal
    if (
      !Blockly.Blocks['block_self_boolean'] ||
      !Blockly.Blocks['block_self_mutator']
    ) {
      Blockly.defineBlocksWithJsonArray([
        {
          type: 'block_self_boolean',
          message0: '布尔值',
          inputsInline: false,
          previousStatement: null,
          nextStatement: null,
          colour: '%{BKY_LOGIC_HUE}'
        },
        {
          type: 'block_self_mutator',
          message0: '%1',
          args0: [
            {
              type: 'input_statement',
              name: 'NAME',
              check: 'Boolean'
            }
          ],
          colour: '%{BKY_LOGIC_HUE}',
          tooltip: ''
        }
      ]);
    }
    Blockly.Extensions.registerMutator(
      'blockly_self_add_mutator',
      {
        /**
         * 生成xml时调用此方法
         */
        mutationToDom() {
          const container = document.createElement('mutation');
          container.setAttribute('items', this.itemCount_);
          return container;
        },

        /**
         * 从xml复原时调用此方法
         */
        domToMutation(xml: any) {
          this.itemCount_ = parseInt(xml.getAttribute('items'), 10);
          this.updateShape();
        },

        /**
         * 更新source block的形状
         */
        updateShape() {
          let i = 1;
          for (i; i <= this.itemCount_; i++) {
            if (!this.getInput(`NAME${i}`)) {
              const input = this.appendValueInput(`NAME${i}`).setCheck(
                'Boolean'
              );
              if (i === 1) {
                input.appendField(
                  new Blockly.FieldDropdown([
                    ['且', '&&'],
                    ['或', '||']
                  ]),
                  'NAME'
                );
              }
            }
          }
          while (this.getInput(`NAME${i}`)) {
            this.removeInput(`NAME${i}`);
            i++;
          }
        },

        /**
         * 打开mutator对话框时调用 --- 根据当前source block的值输入数量，来创建block_self_mutator的数量
         */
        decompose(workspace: any) {
          const containerBlock = workspace.newBlock('block_self_mutator');
          containerBlock.initSvg();
          let connection = containerBlock.getInput('NAME').connection;
          for (let i = 1; i <= this.itemCount_; i++) {
            const temp = workspace.newBlock('block_self_boolean');
            connection.connect(temp.previousConnection);
            temp.initSvg();
            connection = temp.nextConnection;
          }
          return containerBlock;
        },

        /**
         * 当一个mutator对话框保存其内容，被调用，来按照新的设置修改原来的block
         * 'block_self_boolean'
         */
        compose(topBlock: any) {
          let itemBlock = topBlock.getInputTargetBlock('NAME'); // 获取到'NAME'输入（仅有一个输入）
          const connections = []; // 当前mutator中‘block_self_boolean’的数量
          while (itemBlock) {
            connections.push(itemBlock.valueConnection_);
            itemBlock =
              itemBlock.nextConnection &&
              itemBlock.nextConnection.targetBlock();
          }
          // Disconnect any children that don't belong.
          for (let i = 1; i <= this.itemCount_; i++) {
            const connection = this.getInput(`NAME${i}`).connection
              .targetConnection;
            if (connection && connections.indexOf(connection) === -1) {
              connection.disconnect();
            }
          }
          this.itemCount_ = connections.length;
          this.updateShape();
          for (let i = 1; i <= this.itemCount_; i++) {
            Blockly.Mutator.reconnect(connections[i - 1], this, `NAME${i}`);
          }
        },

        /**
         * Store pointers to any connected child blocks. 在compose前调用
         * 'block_self_mutator'
         */
        saveConnections(containerBlock: any) {
          let itemBlock = containerBlock.getInputTargetBlock('NAME');
          let i = 1;
          while (itemBlock) {
            const input = this.getInput('NAME' + i);
            itemBlock.valueConnection_ =
              input && input.connection.targetConnection;
            i++;
            itemBlock =
              itemBlock.nextConnection &&
              itemBlock.nextConnection.targetBlock();
          }
        }
      },
      null,
      ['block_self_boolean']
    );
  }
}
