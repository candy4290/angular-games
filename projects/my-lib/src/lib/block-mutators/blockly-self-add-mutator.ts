import { BlockMutator } from 'ngx-blockly';
declare var Blockly: any;
export class BlocklySelfAddMutator extends BlockMutator {
  inputListLength = 2; // source block需要达到的数量
  block: any;
  constructor(name: string) {
    super(name);
  }

  /**
   * 生成xml时调用此方法
   */
  mutationToDom() {
    // this.block = e;
    // const container = document.createElement('mutation');
    // container.setAttribute('items', `${this.inputListLength}`);
    // return container;
  }

  /**
   * 从xml复原时调用此方法
   */
  domToMutation(xml: any) {
    // this.block = e;
    // this.inputListLength = parseInt(xml.getAttribute('items'), 10);
    // this.updateShape();
  }

  /**
   * 更新source block的形状
   */
  updateShape() {
    let i = 1;
    for (i; i <= this.inputListLength; i++) {
      if (!this.block.getInput(`NAME${i}`)) {
        const input = this.block.appendValueInput(`NAME${i}`);
        if (i === 1) {
          input.appendField(new Blockly.FieldDropdown([['且', '&&'], ['或', '||']]), 'NAME');
        }
      }
    }
    while (this.block.getInput(`NAME${i}`)) {
      this.block.removeInput(`NAME${i}`);
      i++;
    }
  }

  /**
   * 打开mutator对话框时调用 --- 根据当前source block的值输入数量，来创建block_self_mutator的数量
   */
  decompose(workspace: any) {
    const containerBlock = workspace.newBlock('block_self_mutator');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('NAME').connection;
    for (let i = 1; i <= this.inputListLength; i++) {
      const temp = workspace.newBlock('block_self_boolean');
      connection.connect(temp.previousConnection);
      temp.initSvg();
      connection = temp.nextConnection;
    }
    return containerBlock;
  }

  /**
   * 当一个mutator对话框保存其内容，被调用，来按照新的设置修改原来的block
   * 'block_self_boolean'
   */
  compose(topBlock: any) {
    let itemBlock = topBlock.getInputTargetBlock('NAME'); // 获取到'NAME'输入（仅有一个输入）
    const connections = []; // 当前mutator中‘block_self_boolean’的数量
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (let i = 1; i <= this.inputListLength; i++) {
      const connection = this.block.getInput(`NAME${i}`).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.inputListLength = connections.length;
    this.updateShape();
    for (let i = 1; i <= this.inputListLength; i ++) {
      Blockly.Mutator.reconnect(connections[i - 1], this.block, `NAME${i}`);
    }
  }

  /**
   * Store pointers to any connected child blocks. 在compose前调用；为了确保重新排序时，compse功能可以确保任何已经连接到原始块的块都被连接到正确的输入，
   * 'block_self_mutator'
   */
  saveConnections(containerBlock: any) {
    let itemBlock = containerBlock.getInputTargetBlock('NAME');
    let i = 1;
    while (itemBlock) {
      const input = this.block.getInput('NAME' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  }

}
