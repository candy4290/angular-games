import { BlockMutator } from 'ngx-blockly';
export class BlocklySelfAddMutator extends BlockMutator {
  inputListLength = 2; // source block的输入数量（不包括下拉列表）
  block: any;
  constructor(name: string) {
    super(name);
  }

  /**
   * 生成xml时调用此方法
   */
  mutationToDom(e: any) {
    this.block = e;
    this.inputListLength =   this.block.inputList.length;
    const container = document.createElement('mutation');
    container.setAttribute('items', `${this.inputListLength}`);
    return container;
  }

  /**
   * 从xml复原时调用此方法
   */
  domToMutation(xml: any, e: any) {
    this.block = e;
    this.updateShape(+xml.getAttribute('items'), this.inputListLength);
  }

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
  }
 // 打开mutator对话框时调用 --- 根据当前source block的值输入数量，来创建block_self_mutator的数量
  decompose(workspace: any) {
    const containerBlock = workspace.newBlock('block_self_mutator');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('NAME').connection;
    this.inputListLength =   this.block.inputList.length;
    for (let i = 1; i <= this.inputListLength; i++) {
      const temp = workspace.newBlock('block_self_boolean');
      connection.connect(temp.previousConnection);
      temp.initSvg();
      connection = temp.nextConnection;
    }
    return containerBlock;
  }
 // 当一个mutator对话框保存其内容，被调用，来按照新的设置修改原来的block
  compose(topBlock: any) {
    let block = topBlock.getInputTargetBlock('NAME'); // 获取到'NAME'输入（仅有一个输入）
    const connections = []; // 当前mutator中‘block_self_boolean’的数量
    while (block) {
      connections.push(block);
      block = block.getNextBlock();
    }
    this.updateShape(connections.length, this.inputListLength);
  }

}
