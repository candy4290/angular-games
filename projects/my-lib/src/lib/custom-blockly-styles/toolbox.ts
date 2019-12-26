import { Svgs } from '../constants/src';

declare var Blockly: any;

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

// 给目录加上图片
Blockly.tree.BaseNode.prototype.getRowDom = function() {
  const row = document.createElement('div');
  row.className = this.getRowClassName();
  row.style['padding-' + (this.isRightToLeft() ? 'right' : 'left')] =
      this.getPixelIndent_() + 'px';
  const label = this.getLabelDom();
  row.appendChild(this.getIconDom());
  row.appendChild(label);
  if (label.textContent) {
    if (this.hasChildren()) {
      // 加上目录展开闭合的照片
      const icon = document.createElement('span');
      icon.innerHTML = Svgs.categoryIcon;
      icon.style.flexGrow = '1';
      icon.style.display = 'flex';
      icon.style.justifyContent = 'flex-end';
      label.parentNode.appendChild(icon);
    }
    const img = document.createElement('img');
    img.src = this.getCategoryConfig(label.textContent).itemImg.commonUrl;
    img.style.height = '24px';
    img.style.margin = '0 10px 0 8px';
    label.parentNode.insertBefore(img, label);
  }
  return row;
};

// 给选中的条目加上背景色
Blockly.Toolbox.prototype.handleBeforeTreeSelected_ = function(node) {
  if (node === this.tree_) {
    return false;
  }
  if (this.lastCategory_) {
    let categoryConfig: any;
    categoryConfig = this.tree_.getCategoryConfig(this.lastCategory_.content_);
    this.lastCategory_.getRowElement().style.backgroundColor = '';
    const children =   this.lastCategory_.getRowElement().children;
    if (categoryConfig && children && children.length > 1) {
      children[1].src = categoryConfig.itemImg.commonUrl;
    }
  }
  if (node) {
    this.loadVariable(node);
    let categoryConfig: any;
    if (node && node.content_) {
      categoryConfig = this.tree_.getCategoryConfig(node.content_);
    }
    const hexColour = node.hexColour || '#57e';
    node.getRowElement().style.backgroundColor = hexColour;
    const children = node.getRowElement().children;
    if (children && children.length > 1) {
      children[1].src = categoryConfig.itemImg.activeUrl;
    }
    this.addColour_(node);
  }
  return true;
};

// 获取目录的配置文件（选中的图标+未选中时的图标）
Blockly.tree.BaseNode.prototype.getCategoryConfig = function(labelContext: string) {
  let commonUrl: string;
  let activeUrl: string;
  if (!this.categoriesInObject) {
    this.categoriesInObject = {};
  }
  switch (labelContext) {
    case '查询结果':  case '变量': case '逻辑':
    case '循环': case '数学': case '文本': case '列表':
      commonUrl = 'https://ng.ant.design/assets/img/logo.svg';
      activeUrl = 'https://www.primefaces.org/primeng/assets/showcase/images/mask.svg';
      break;
    default:
      commonUrl = (this.categoriesInObject[labelContext] || {}).commonUrl || ' https://ng.ant.design/assets/img/logo.svg';
      activeUrl =  (this.categoriesInObject[labelContext] || {}).activeUrl || 'https://www.primefaces.org/primeng/assets/showcase/images/mask.svg';
  }
  return {
    itemImg: {
      commonUrl, activeUrl
    }
  };
};

// 增加baseNode的属性：code,以便于点击目录时，异步加载block
Blockly.Toolbox.prototype.syncTrees_ = function(treeIn, treeOut, pathToMedia) {
  let openNode = null;
  let lastElement = null;
  for (let i = 0, childIn; childIn = treeIn.childNodes[i]; i++) {
    if (!childIn.tagName) {
      // Skip over text.
      continue;
    }
    switch (childIn.tagName.toUpperCase()) {
      case 'CATEGORY':
        // Decode the category name for any potential message references
        // (eg. `%{BKY_CATEGORY_NAME_LOGIC}`).
        const categoryName = Blockly.utils.replaceMessageReferences(
            childIn.getAttribute('name'));
        const childOut = this.tree_.createNode(categoryName);
        childOut.onSizeChanged(this.handleNodeSizeChanged_);
        childOut.blocks = [];
        treeOut.add(childOut);
        const custom = childIn.getAttribute('custom');
        if (custom) {
          // Variables and procedures are special dynamic categories.
          childOut.blocks = custom;
        } else {
          const newOpenNode = this.syncTrees_(childIn, childOut, pathToMedia);
          if (newOpenNode) {
            openNode = newOpenNode;
          }
        }

        const styleName = childIn.getAttribute('categorystyle');
        const colour = childIn.getAttribute('colour');
        const code = childIn.getAttribute('code');
        if (code) {
          this.setCode_(code, childOut, categoryName);
        }
        if (colour && styleName) {
          childOut.hexColour = '';
          console.warn('Toolbox category "' + categoryName +
              '" can not have both a style and a colour');
        } else if (styleName) {
          this.setColourFromStyle_(styleName, childOut, categoryName);
        } else {
          this.setColour_(colour, childOut, categoryName);
        }

        if (childIn.getAttribute('expanded') === 'true') {
          if (childOut.blocks.length) {
            // This is a category that directly contains blocks.
            // After the tree is rendered, open this category and show flyout.
            openNode = childOut;
          }
          childOut.setExpanded(true);
        } else {
          childOut.setExpanded(false);
        }
        lastElement = childIn;
        break;
      case 'SEP':
        if (lastElement && lastElement.tagName.toUpperCase() === 'CATEGORY') {
          // Separator between two categories.
          // <sep></sep>
          treeOut.add(new Blockly.Toolbox.TreeSeparator(
              /** @type {!Blockly.tree.BaseNode.Config} */ (this.treeSeparatorConfig_)));
        }
        break;
        // Otherwise falls through.
      case 'BLOCK':
      case 'SHADOW':
      case 'LABEL':
      case 'BUTTON':
        treeOut.blocks.push(childIn);
        lastElement = childIn;
        break;
    }
  }
  return openNode;
};

Blockly.Toolbox.prototype.setCode_ = function(codeValue, childOut,
  categoryName) {
  if (codeValue) {
    childOut.code = codeValue;
  }
};
