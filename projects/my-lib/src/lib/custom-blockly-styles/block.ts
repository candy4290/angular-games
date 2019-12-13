declare var Blockly: any;
// 更新input,和output的卡槽形状
Blockly.blockRendering.ConstantProvider.prototype.makePuzzleTab = function() {
      const width = this.TAB_WIDTH;
      const height = this.TAB_HEIGHT;

      // 圆形
      // function makeMainPath(up) {
      //   const forward = up ? -1 : 1;
      //   return Blockly.utils.svgPaths.arc('a', `90 1 ${up ? 1 : 0}`, width / 2, ` 0,${height * forward}`)
      // }

      // 菱形 l -4,-3.5 0,-8 4,-3.5   l -4,3.5 0,8 4,3.5
      function makeMainPath(up) {
        const forward = up ? -1 : 1;
        return Blockly.utils.svgPaths.line([
          Blockly.utils.svgPaths.point(-width / 2, forward * (height - width) / 2),
          Blockly.utils.svgPaths.point(0, forward * width),
          Blockly.utils.svgPaths.point(width / 2, forward * (height - width) / 2),
        ]);
      }


      const pathUp = makeMainPath(true);
      const pathDown = makeMainPath(false);
      return {
        width,
        height,
        pathDown,
        pathUp
      };
    };

Blockly.geras.HighlightConstantProvider.prototype.makePuzzleTab = function() {
  const width = this.constantProvider.TAB_WIDTH;
  const height = this.constantProvider.TAB_HEIGHT;

  // This is how much of the vertical block edge is actually drawn by the puzzle
  // tab.
  const verticalOverlap = 2.5;

  const highlightRtlUp =
      Blockly.utils.svgPaths.moveBy(-2, -height + verticalOverlap + 0.9) +
      Blockly.utils.svgPaths.lineTo(width * -0.45, -2.1);

  const highlightRtlDown =
      Blockly.utils.svgPaths.lineOnAxis('v', verticalOverlap) +
      Blockly.utils.svgPaths.moveBy(-width * 0.97, 2.5 + height) +
      // Blockly.utils.svgPaths.curve('q',
      //     [
      //       Blockly.utils.svgPaths.point(-width * 0.05, 10),
      //       Blockly.utils.svgPaths.point(width * 0.3, 9.5)
      //     ]) +
      Blockly.utils.svgPaths.moveBy(width * 0.67, -1.9) +
      Blockly.utils.svgPaths.lineOnAxis('v', verticalOverlap);

  const highlightLtrUp =
      Blockly.utils.svgPaths.lineOnAxis('v', -0.5) +
      Blockly.utils.svgPaths.moveBy(width * -0.92, -0.5 - height) +
      // Blockly.utils.svgPaths.curve('q',
      //     [
      //       Blockly.utils.svgPaths.point(width * -0.19, -5.5),
      //       Blockly.utils.svgPaths.point(0,-11)
      //     ]) +
      Blockly.utils.svgPaths.moveBy(width * 0.92, 1);

  const highlightLtrDown =
      Blockly.utils.svgPaths.moveBy(-3.5, height - 3.5) +
      Blockly.utils.svgPaths.lineTo(width * 0.5, (height - width) / 2);

  return {
    width,
    height,
    pathUp: (rtl) => {
      return rtl ? highlightRtlUp : highlightLtrUp;
    },
    pathDown: (rtl) => {
      return rtl ? highlightRtlDown : highlightLtrDown;
    }
  };
};

Blockly.blockRendering.ConstantProvider.prototype.init = function() {
  // this.SMALL_PADDING = 8;
  // this.MEDIUM_PADDING = 8;
  // this.TALL_INPUT_FIELD_OFFSET_Y = this.MEDIUM_PADDING;
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

// 绘制statement上下连接的路径
Blockly.blockRendering.ConstantProvider.prototype.makeNotch = function() {
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
export default Blockly.FieldDropdown.prototype.showEditor_ = function() {
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
