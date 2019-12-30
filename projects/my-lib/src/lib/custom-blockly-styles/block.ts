declare const Blockly: any;

Blockly.blockRendering.ConstantProvider.prototype.init = function() {
  // topRow的高度
  this.NO_PADDING = 0;
  this.SMALL_PADDING = 3;
  this.MEDIUM_PADDING = 5;
  this.MEDIUM_LARGE_PADDING = 8;
  this.LARGE_PADDING = 10;

  // Offset from the top of the row for placing fields on inline input rows
  // and statement input rows.
  // Matches existing rendering (in 2019).
  this.TALL_INPUT_FIELD_OFFSET_Y = this.MEDIUM_PADDING;

  // tab的高度
  this.TAB_HEIGHT = 15;
  // tab的宽度
  this.TAB_WIDTH = 8;
  // tab在y轴的偏移(输出tab距离顶部的偏移量)
  this.TAB_OFFSET_FROM_TOP = 5;

  this.TAB_VERTICAL_OVERLAP = 2.5;

  // statement上下连接点的宽度和高度
  this.NOTCH_WIDTH = 15;
  this.NOTCH_HEIGHT = 4;

  // This is the minimum width of a block measuring from the end of a rounded
  // corner
  this.MIN_BLOCK_WIDTH = 12;

  this.EMPTY_BLOCK_SPACER_HEIGHT = 16;

  /**
   * dummy input的最小高度
   */
  this.DUMMY_INPUT_MIN_HEIGHT = this.TAB_HEIGHT;

  // 圆角大小
  this.CORNER_RADIUS = 4;

  // Offset from the left side of a block or the inside of a statement input to
  // the left side of the notch.
  this.NOTCH_OFFSET_LEFT = 15;

  this.STATEMENT_BOTTOM_SPACER = 0;
  this.STATEMENT_INPUT_PADDING_LEFT = 20;
  this.BETWEEN_STATEMENT_PADDING_Y = 4;

  // This is the max width of a bottom row that follows a statement input and
  // has inputs inline.
  this.MAX_BOTTOM_WIDTH = 66.5;

  this.START_HAT_HEIGHT = 15;
  this.START_HAT_WIDTH = 100;

  this.SPACER_DEFAULT_HEIGHT = 15;
  //  block块的最小高度
  this.MIN_BLOCK_HEIGHT = 24;

  // inline input的padding
  this.EMPTY_INLINE_INPUT_PADDING = 14.5;
  // input input的高度
  this.EMPTY_INLINE_INPUT_HEIGHT = this.TAB_HEIGHT + 11;

  this.EXTERNAL_VALUE_INPUT_PADDING = 2;

  // statement input的高度
  // this.EMPTY_STATEMENT_INPUT_HEIGHT = this.MIN_BLOCK_HEIGHT;

  // this.START_POINT = Blockly.utils.svgPaths.moveBy(0, 0);

  // 块折叠后的高度+宽度
  // this.JAGGED_TEETH_HEIGHT = 12;
  // this.JAGGED_TEETH_WIDTH = 6;

  this.JAGGED_TEETH = this.makeJaggedTeeth();
  this.NOTCH = this.makeNotch();
  this.START_HAT = this.makeStartHat();
  this.PUZZLE_TAB = this.makePuzzleTab();
  /**
   * 内部圆角
   */
  this.INSIDE_CORNERS = this.makeInsideCorners();
  /**
   * 外部圆角
   */
  this.OUTSIDE_CORNERS = this.makeOutsideCorners();
};

// 更新input,和output的卡槽形状
Blockly.blockRendering.ConstantProvider.prototype.makePuzzleTab = function() {
  const width = this.TAB_WIDTH;
  const height = this.TAB_HEIGHT;

  // 圆形
  // function makeMainPath(up, left) {
  //   const forward = up ? -1 : 1;
  //   return Blockly.utils.svgPaths.arc('a', `90 1 ${up ? 1 : 0}`, width / 2, ` 0,${height * forward}`)
  // }

  // 菱形 l -4,-3.5 0,-8 4,-3.5   l -4,3.5 0,8 4,3.5
  function makeMainPath(up, left, h = height) {
    const forward = up ? -1 : 1;
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-width / 2, forward * (height - width) / 2),
      Blockly.utils.svgPaths.point(0, forward * width),
      Blockly.utils.svgPaths.point(width / 2, forward * (height - width) / 2),
    ]);
  }

  // 三角形   l -8, -8  8,-8 z   l 8,8  -8,8
  // function makeMainPath(up, left, h = height) {
  //   const forward = up ? -1 : 1;
  //   const isLeft = left ? 1 : -1;
  //   return Blockly.utils.svgPaths.line([
  //     Blockly.utils.svgPaths.point(-h / 2 * isLeft, forward * h / 2),
  //     Blockly.utils.svgPaths.point(h / 2 * isLeft, forward * h / 2),
  //   ]);
  // }

  const pathUp = makeMainPath(true, true);
  const pathDown = makeMainPath(false, true);
  const pathRightUp = makeMainPath(true, false);
  return {
    width,
    height,
    pathDown,
    pathUp: (h: number) => {
      return makeMainPath(true, true, h);
    },
    pathRightUp
  };
};

// 三层blockPath之一:blocklyPathLight, 可以通过定制主题，来不显示blocklyPathLight和blocklyPathDark
// Blockly.geras.HighlightConstantProvider.prototype.makePuzzleTab = function() {
//   const width = this.constantProvider.TAB_WIDTH;
//   const height = this.constantProvider.TAB_HEIGHT;

//   // This is how much of the vertical block edge is actually drawn by the puzzle
//   // tab.
//   const verticalOverlap = 2.5;

//   const highlightRtlUp =
//       Blockly.utils.svgPaths.moveBy(-2, -height + verticalOverlap + 0.9) +
//       Blockly.utils.svgPaths.lineTo(width * -0.45, -2.1);

//   const highlightRtlDown =
//       Blockly.utils.svgPaths.lineOnAxis('v', verticalOverlap) +
//       Blockly.utils.svgPaths.moveBy(-width * 0.97, 2.5 + height) +
//       // Blockly.utils.svgPaths.curve('q',
//       //     [
//       //       Blockly.utils.svgPaths.point(-width * 0.05, 10),
//       //       Blockly.utils.svgPaths.point(width * 0.3, 9.5)
//       //     ]) +
//       Blockly.utils.svgPaths.moveBy(width * 0.67, -1.9) +
//       Blockly.utils.svgPaths.lineOnAxis('v', verticalOverlap);

//   const highlightLtrUp =
//       Blockly.utils.svgPaths.lineOnAxis('v', -0.5) +
//       Blockly.utils.svgPaths.moveBy(width * -0.92, -0.5 - height) +
//       // Blockly.utils.svgPaths.curve('q',
//       //     [
//       //       Blockly.utils.svgPaths.point(width * -0.19, -5.5),
//       //       Blockly.utils.svgPaths.point(0,-11)
//       //     ]) +
//       Blockly.utils.svgPaths.moveBy(width * 0.92, 1);

//   const highlightLtrDown =
//       Blockly.utils.svgPaths.moveBy(-3.5, height - 3.5) +
//       Blockly.utils.svgPaths.lineTo(width * 0.5, (height - width) / 2);

//   return {
//     width,
//     height,
//     pathUp: (rtl) => {
//       return rtl ? highlightRtlUp : highlightLtrUp;
//     },
//     pathDown: (rtl) => {
//       return rtl ? highlightRtlDown : highlightLtrDown;
//     }
//   };
// };

// 绘制statement上下连接的路径
export default Blockly.blockRendering.ConstantProvider.prototype.makeNotch = function() {
  const width = this.NOTCH_WIDTH;
  const height = this.NOTCH_HEIGHT;
  const innerWidth = 8;
  const outerWidth = (width - innerWidth) / 2;
  function makeMainPath(dir) {
    return Blockly.utils.svgPaths.line(
        [
          Blockly.utils.svgPaths.point(dir * outerWidth, height),
          Blockly.utils.svgPaths.point(dir * innerWidth, 0),
          Blockly.utils.svgPaths.point(dir * outerWidth, -height)
        ]);
  }
  const pathLeft = makeMainPath(1);
  const pathRight = makeMainPath(-1);
  return {
    width,
    height,
    pathLeft,
    pathRight
  };
};

// 展示下拉弹窗 --- 让其背景色与sourceblock颜色一致
Blockly.FieldDropdown.prototype.showEditor_ = function() {
  this.menu_ = this.dropdownCreate_();
  const parentDiv =   Blockly.DropDownDiv.getContentDiv().parentNode;
  parentDiv.style.backgroundColor = parentDiv.style.borderColor = this.sourceBlock_.colour_;
  this.menu_.render(Blockly.DropDownDiv.getContentDiv());
  Blockly.utils.dom.addClass((this.menu_.getElement()), 'blocklyDropdownMenu');
  Blockly.DropDownDiv.showPositionedByField(
      this, this.dropdownDispose_.bind(this));
  this.menu_.focus();
  if (this.selectedMenuItem_) {
    Blockly.utils.style.scrollIntoContainerView((this.selectedMenuItem_.getElement()), (this.menu_.getElement()));
  }
};

// INPUT中的field区域
// Blockly.Field.prototype.createBorderRect_ = function() {
//   this.size_.height =
//       Math.max(this.size_.height, Blockly.Field.BORDER_RECT_DEFAULT_HEIGHT);
//   this.size_.width =
//       Math.max(this.size_.width, Blockly.Field.X_PADDING);
//   this.borderRect_ = Blockly.utils.dom.createSvgElement('rect',
//       {
//         rx: 4,
//         ry: 4,
//         x: 0,
//         y: 0,
//         height: this.size_.height,
//         width: this.size_.width
//       }, this.fieldGroup_);
//   this.borderRect_.style.fill = this.sourceBlock_.colour_;
//   this.borderRect_.setAttribute('stroke', '#fff');
// };

// dropdown的向下图标的颜色
// Blockly.FieldDropdown.prototype.updateColour = function() {
//   // Update arrow's colour.
//   if (this.sourceBlock_ && this.arrow_) {
//     if (this.sourceBlock_.isShadow()) {
//       this.arrow_.style.fill = this.sourceBlock_.getColourShadow();
//     } else {
//       this.arrow_.style.fill = '#FFF';
//     }
//   }
// };

// inline input
// Blockly.blockRendering.Drawer.prototype.drawInlineInput_ = function(input) {
//   const width = input.width;
//   const height = input.height;
//   const yPos = input.centerline - height / 2;

//   const connectionTop = input.connectionOffsetY;
//   const connectionBottom = input.connectionHeight + connectionTop;
//   const connectionRight = input.xPos + input.connectionWidth / 2;
//   // console.log(width, height, yPos, connectionTop, connectionBottom, connectionRight);
//   // console.log( input.shape.pathDown);
//   // console.log(input.shape);
//   this.inlinePath_ += Blockly.utils.svgPaths.moveTo(connectionRight, yPos * 2) +
//       input.shape.pathDown +
//       Blockly.utils.svgPaths.lineOnAxis('h', width - input.connectionWidth) +
//       input.shape.pathRightUp +
//       'z';
//   // console.log(this.inlinePath_);
//   this.positionInlineInputConnection_(input);
// };

// block右侧
// Blockly.blockRendering.Drawer.prototype.drawRightSideRow_ = function(row) {
//   this.outlinePath_ +=
//       Blockly.utils.svgPaths.lineOnAxis('V', row.yPos + row.height);
// };

// Blockly.blockRendering.Drawer.prototype.drawOutline_ = function() {
//   this.drawTop_();
//   for (let r = 1; r < this.info_.rows.length - 1; r++) {
//     const row = this.info_.rows[r];
//     if (row.hasJaggedEdge) {
//       // block被收起时的右侧齿状
//       this.drawJaggedEdge_(row);
//     } else if (row.hasStatement) {
//       // block statement的输入
//       this.drawStatementInput_(row);
//     } else if (row.hasExternalInput) {
//       // block外部的input框
//       this.drawValueInput_(row);
//     } else {
//       this.drawRightSideRow_(row);
//     }
//   }
//   this.drawBottom_();
//   this.drawLeft_();
// };

// blockly左侧
// Blockly.blockRendering.Drawer.prototype.drawLeft_ = function() {
//   const outputConnection = this.info_.outputConnection;
//   this.positionOutputConnection_();

//   if (outputConnection) {
//     const tabBottom = this.info_.bottomRow.baseline;
//     const pathUp = (typeof outputConnection.shape.pathUp === "function") ?
//         outputConnection.shape.pathUp(tabBottom) :
//         outputConnection.shape.pathUp;

//     // Draw a line up to the bottom of the tab.
//     this.outlinePath_ +=
//         Blockly.utils.svgPaths.lineOnAxis('V', tabBottom) +
//         pathUp;
//   }
//   // Close off the path.  This draws a vertical line up to the start of the
//   // block's path, which may be either a rounded or a sharp corner.
//   this.outlinePath_ += 'z';
// };
// Blockly.blockRendering.Renderer.prototype.render = function(block) {
//   console.log(block);
//   if (Blockly.blockRendering.useDebugger && !block.renderingDebugger) {
//     block.renderingDebugger = this.makeDebugger_();
//   }
//   const info = this.makeRenderInfo_(block);
//   info.measure();
//   console.log(info);
//   this.makeDrawer_(block, info).draw();
// };

// Blockly.blockRendering.RenderInfo.prototype.measure = function() {
//   // 创建 topRow,inputRows,bottomRow
//   this.createRows_();
//   this.addElemSpacing_();
//   this.computeBounds_();
//   this.alignRowElements_();
//   this.addRowSpacing_();
//   this.finalize_();
// };

// file输入的最大字符数，超出显示省略号
// Blockly.Field.prototype.maxDisplayLength = 10;

Blockly.FieldTextInput.prototype.showInlineEditor_ = function(quietInput) {
  Blockly.WidgetDiv.show(
      this, this.sourceBlock_.RTL, this.widgetDispose_.bind(this));
  this.htmlInput_ = this.widgetCreate_();
  this.isBeingEdited_ = true;
  if (!quietInput) {
    if (this.multipleMode) {
      this.htmlInput_.focus();
    } else {
      this.htmlInput_.focus();
      this.htmlInput_.select();
    }
  }
};

Blockly.FieldTextInput.prototype.widgetCreate_ = function() {
  const div = Blockly.WidgetDiv.DIV;
  if (this.multipleMode) {
    const htmlUl = document.createElement('ul');
    htmlUl.className = 'app-blockly-ul';
    const values = this.getEditorText_(this.value_);
    if (values) {
      values.split(',').forEach(value => {
        const htmlLi = document.createElement('li');
        htmlLi.className = 'app-blockly-li';
        htmlLi.innerText = value;
        htmlUl.appendChild(htmlLi);
      });
    }
    const htmlLiInput = document.createElement('li');
    const htmlInput = document.createElement('div');
    htmlInput.style.minWidth = '4px';
    htmlInput.setAttribute('contenteditable', 'true');
    htmlLiInput.className = 'app-blockly-li';
    htmlLiInput.appendChild(htmlInput);
    htmlLiInput.style.background = '#fff';
    htmlUl.appendChild(htmlLiInput);
    div.appendChild(htmlUl);

    htmlInput['untypedDefaultValue_'] = this.value_;
    htmlInput['oldValue_'] = null;
    if (Blockly.utils.userAgent.GECKO) {
      // In FF, ensure the browser reflows before resizing to avoid issue #2777.
      setTimeout(this.resizeEditor_.bind(this), 0);
    } else {
      this.resizeEditor_();
    }

    this.bindInputEvents_(htmlInput);
    return htmlInput;
  } else {
    const htmlInput = (document.createElement('input'));
    htmlInput.className = 'blocklyHtmlInput';
    htmlInput.setAttribute('spellcheck', this.spellcheck_);
    const fontSize =
        (Blockly.FieldTextInput.FONTSIZE * this.workspace_.scale) + 'pt';
    div.style.fontSize = fontSize;
    htmlInput.style.fontSize = fontSize;
    const borderRadius =
        (Blockly.FieldTextInput.BORDERRADIUS * this.workspace_.scale) + 'px';
    htmlInput.style.borderRadius = borderRadius;
    div.appendChild(htmlInput);

    htmlInput.value = htmlInput.defaultValue = this.getEditorText_(this.value_);
    htmlInput['untypedDefaultValue_'] = this.value_;
    htmlInput['oldValue_'] = null;
    if (Blockly.utils.userAgent.GECKO) {
      // In FF, ensure the browser reflows before resizing to avoid issue #2777.
      setTimeout(this.resizeEditor_.bind(this), 0);
    } else {
      this.resizeEditor_();
    }
    this.bindInputEvents_(htmlInput);
    return htmlInput;
  }
};

Blockly.FieldTextInput.prototype.onHtmlInputChange_ = function(_e) {
  const text = this.htmlInput_.value || this.htmlInput_.innerText;
  if (text !== this.htmlInput_.oldValue_) {
    this.htmlInput_.oldValue_ = text;
    Blockly.Events.setGroup(true);
    const value = this.getValueFromEditorText_(text);
    this.setValue(value);
    Blockly.Events.setGroup(false);
  }
};
