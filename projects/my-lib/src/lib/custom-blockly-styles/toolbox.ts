
declare var Blockly: any;

Blockly.TOOLBOX_AT_LEFT = 10;
// 取出目录左边的颜色条
Blockly.Toolbox.prototype.addColour_ = () => {};

// 选中元素增加class类 --- 选中后,展开图标变为白色
Blockly.tree.BaseNode.prototype.getRowClassName = function() {
  let selectedClass = '';
  if (this.isSelected()) {
    selectedClass = ' ' + (this.config_.cssSelectedRow || '') + ' ' + 'app-blockly-selected ';
  }
  return this.config_.cssTreeRow + selectedClass;
};

 // 控制目录展开闭合的图标
export default Blockly.tree.TreeNode.prototype.getCalculatedIconClass = function() {
  const expanded = this.getExpanded();
  // fall back on default icons
  if (this.hasChildren()) {
    if (expanded) {
      return  'app-blockly-expanded';
    } else if (!expanded) {
      return'app-blockly-collapsed';
    }
  } else {
    return '';
  }

};
