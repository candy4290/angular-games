import { BlockMutator } from 'ngx-blockly';
declare var Blockly: any;
export class BlocklySelfAddMutator extends BlockMutator {
  inputListLength = 2; // 当前source block的输入数量
  block: any;
  constructor(name: string) {
    super(name);
  }

  /**
   * 生成xml时调用此方法
   */
  mutationToDom(e: any) {
    this.block = e;
    if (!this.inputListLength) {
      return null;
    } else {
      const container = document.createElement('mutation');
      container.setAttribute('items', `${this.inputListLength}`);
      console.log(container);
      return container;
    }
  }

  /**
   * 从xml复原时调用此方法
   */
  domToMutation(xml: any, e: any) {
    this.block = e;
    this.updateShape(+xml.getAttribute('items'), this.inputListLength);
  }

  /**
   * 更新source block的形状
   */
  updateShape(exceptedLength: number, currentLength: number) {
    if (exceptedLength > currentLength) {
      // 增加source block的输入
      for (let i = 1; i <= exceptedLength - currentLength; i++) {
        this.block.appendValueInput(`NAME${currentLength + i}`);
      }
    } else if  (exceptedLength < currentLength) {
      // 删除source block的输入
      for (let i = 0; i < currentLength - exceptedLength; i++) {
        this.block.removeInput(`NAME${currentLength - i}`);
      }
    }
    this.inputListLength = exceptedLength;
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
    this.updateShape(connections.length, this.inputListLength);
    for (let i = 1; i <= this.inputListLength; i ++) {
      Blockly.Mutator.reconnect(connections[i - 1], this.block, `NAME${i}`);
    }
  }

  /**
   * Store pointers to any connected child blocks. 在compose前调用
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
