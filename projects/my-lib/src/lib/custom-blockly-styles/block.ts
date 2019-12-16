declare const Blockly: any;

Blockly.blockRendering.ConstantProvider.prototype.init = function() {
  // topRow的高度
  // this.SMALL_PADDING = 8;
  // this.MEDIUM_PADDING = 8;

  // tab在y轴的偏移(输出tab距离顶部的偏移量)
  // this.TAB_OFFSET_FROM_TOP = 8;

  // statement上下连接点的宽度和高度
  this.NOTCH_WIDTH = 15;
  this.NOTCH_HEIGHT = 4;
  // 圆角大小
  this.CORNER_RADIUS = 4;
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
    pathUp: (height) => {
      return makeMainPath(true, true, height)
    },
    pathRightUp
  };
};

// 三层blockPath之一:blocklyPathLight
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
Blockly.blockRendering.Drawer.prototype.drawRightSideRow_ = function(row) {
  this.outlinePath_ +=
      Blockly.utils.svgPaths.lineOnAxis('V', row.yPos + row.height);
};

Blockly.blockRendering.Drawer.prototype.drawOutline_ = function() {
  this.drawTop_();
  for (let r = 1; r < this.info_.rows.length - 1; r++) {
    const row = this.info_.rows[r];
    if (row.hasJaggedEdge) {
      // block被收起时的右侧齿状
      this.drawJaggedEdge_(row);
    } else if (row.hasStatement) {
      // block statement的输入
      this.drawStatementInput_(row);
    } else if (row.hasExternalInput) {
      // block外部的input框
      console.log(row);
      console.log(row.getLastInput());
      this.drawValueInput_(row);
    } else {
      this.drawRightSideRow_(row);
    }
  }
  this.drawBottom_();
  this.drawLeft_();
};

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
