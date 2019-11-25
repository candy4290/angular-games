import { BlockMutator } from 'ngx-blockly';
declare const Blockly: any;
export class BlocklySelfAddMutator extends BlockMutator {
  inputListLength = 2;
  block: any;
  constructor(name: string) {
    super(name);
  }

  /**
   * 生成xml时调用此方法
   */
  mutationToDom(e: any) {
    console.log('mutationToDom');
    this.block = e;
    this.inputListLength =   this.block.inputList.length - 1;
    const container = document.createElement('mutation');
    const relationShip = this.block.getFieldValue('NAME');
    // var divisorInput = (this.getFieldValue('PROPERTY') == 'DIVISIBLE_BY');
    container.setAttribute('divisor_input', relationShip);
    return container;
  }

  /**
   * 从xml复原时调用此方法
   */
  domToMutation(xml: any) {
    console.log('domToMutation' + xml);
    this.updateShape();  // Helper function for adding/removing 2nd input
  }

  updateShape() {

  }
 // 打开mutator对话框时调用
  decompose(workspace: any) {
    console.log('decompose');
    console.log(this.block);
    const containerBlock = workspace.newBlock('block_self_mutator');
    containerBlock.initSvg();
    let connection = containerBlock.inputList[0].connection;
    this.inputListLength =   this.block.inputList.length - 1;
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
    console.log();
    let block = topBlock.getInputTargetBlock('NAME');
    const connections = [];
    while (block) {
      block = block.getInputTargetBlock('NAME');
      connections.push(block);
    }
  }

}
