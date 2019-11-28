import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category, XmlBlock } from 'ngx-blockly';
declare var Blockly: any;

export const LOGIC_CATEGORY: Category = new Category([
  new XmlBlock('controls_if'),
  new XmlBlock('logic_compare'),
  new XmlBlock('logic_operation'),
  new XmlBlock('logic_block_self_add'),
  new XmlBlock('logic_negate'),
  new XmlBlock('logic_boolean'),
  new XmlBlock('logic_null'),
  new XmlBlock('logic_ternary'),
], '%{BKY_LOGIC_HUE}', '逻辑', null );

export const LOOP_CATEGORY: Category = new Category([
  new XmlBlock('controls_repeat_ext'),
  new XmlBlock('controls_whileUntil'),
  new XmlBlock('controls_for'),
  new XmlBlock('controls_forEach'),
  new XmlBlock('controls_flow_statements'),
  new XmlBlock('controls_flow_statements')
], '%{BKY_LOOPS_HUE}', '循环', null);


export const MATH_CATEGORY: Category = new Category([
  new XmlBlock('math_number'),
  new XmlBlock('math_arithmetic'),
  // new XmlBlock('math_single'),  // 平方根，绝对值等等
  // new XmlBlock('math_trig'),  // sin,cos等等
  // new XmlBlock('math_constant'), // 3.14等常亮
  new XmlBlock('math_number_property'), // 判断整数，小数等等
  new XmlBlock('math_round'), // 四舍五入
  new XmlBlock('math_on_list'), // 列表中数值的和，平均数等等
  new XmlBlock('math_modulo'), // 两数取余
  // new XmlBlock('math_constrain'), // math.min(Math.max(0,5), 100)
  new XmlBlock('math_random_int'), // 生成a-b间的随机整数
  new XmlBlock('math_random_float'), // 生成0-1间的随机数
  // new XmlBlock('math_atan2') // 计算方位角
], '%{BKY_MATH_HUE}', '数学', null);

export const TEXT_CATEGORY: Category = new Category([
  new XmlBlock('text'),
  new XmlBlock('text_join'), // 合并文本
  new XmlBlock('text_append'), // 附加文本
  new XmlBlock('text_length'), // 文本长度
  new XmlBlock('text_isEmpty'),
  new XmlBlock('text_indexOf'),
  new XmlBlock('text_charAt'),
  new XmlBlock('text_getSubstring'),
  new XmlBlock('text_changeCase'), // 大小写转换
  new XmlBlock('text_trim'), // 消除字符串空白
  new XmlBlock('text_print'), // alert
  new XmlBlock('text_prompt_ext'), // 让用户输入，并给其提示
], '%{BKY_TEXTS_HUE}', '文本', null);

export const LISTS_CATEGORY: Category = new Category([
  new XmlBlock('lists_create_with'), // 建立列表---数组
  // new XmlBlock('lists_repeat'), // 建立多个一样的列表
  // new XmlBlock('lists_length'),
  // new XmlBlock('lists_isEmpty'),
  // new XmlBlock('lists_indexOf'),
  // new XmlBlock('lists_getIndex'),
  // new XmlBlock('lists_setIndex'),
  // new XmlBlock('lists_getSublist'),
  new XmlBlock('lists_split'),
  new XmlBlock('lists_sort'), // 列表排序
], '%{BKY_LISTS_HUE}', '列表', null);

// export const COLOUR_CATEGORY: Category = new Category([
//   new XmlBlock('colour_picker'),
//   new XmlBlock('colour_random'),
//   new XmlBlock('colour_random'),
//   new XmlBlock('colour_blend')
// ], '%{BKY_COLOUR_HUE}', 'Colours', '');

export const VARIABLES_CATEGORY: Category = new Category([], '%{BKY_VARIABLES_HUE}', '变量', 'VARIABLE');

// export const FUNCTIONS_CATEGORY: Category = new Category([], '%{BKY_PROCEDURES_HUE}', 'Functions', 'PROCEDURE');

@Injectable({
  providedIn: 'root'
})

export class BlocklyService {

  constructor(private http: HttpClient) {
  }

  /**
   * 获取xml文件内容
   *
   */
  getXml(path?: string) {
    return this.http.get(path || 'assets/blockly/xmls/demo3.xml', {
      responseType: 'text'
    });
  }

  jsToContent(code: string) {

  }

  /**
   * 加载mutator中使用到的block,这些block不需要转化为代码，只是用来构造source block的结构（例如增删inputs数量）
   */
  loadBlockInMutator() {
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'block_self_boolean',
        message0: '布尔值',
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: '%{BKY_LOGIC_HUE}',
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
        tooltip: '',
      }
    ]);
    Blockly.Extensions.registerMutator('blockly_self_add_mutator', {
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
            const input = this.appendValueInput(`NAME${i}`);
            if (i === 1) {
              input.appendField(new Blockly.FieldDropdown([['and', '&&'], ['or', '||']]), 'NAME');
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
          itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
        }
        // Disconnect any children that don't belong.
        for (let i = 1; i <= this.itemCount_; i++) {
          const connection = this.getInput(`NAME${i}`).connection.targetConnection;
          if (connection && connections.indexOf(connection) === -1) {
            connection.disconnect();
          }
        }
        this.itemCount_ = connections.length;
        this.updateShape();
        for (let i = 1; i <= this.itemCount_; i ++) {
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
          itemBlock.valueConnection_ = input && input.connection.targetConnection;
          i++;
          itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
        }
      }
    }, null, ['block_self_boolean']);
  }

  /**
   * 更改toolbox样式
   */
  changeToolboxStyle() {
    Blockly.Toolbox.prototype.addColour_ = function(opt_tree) {
    };

    Blockly.Toolbox.prototype.updateSelectedItemColour_ = function(tree) {
      // const selectedItem = tree.getSelectedItem();
      // if (selectedItem) {
        // const hexColour = selectedItem.hexColour || '#57e';
        // selectedItem.getRowElement().style.backgroundColor = hexColour;
        // this.addColour_(selectedItem);
      // }
    };

    Blockly.Toolbox.prototype.handleBeforeTreeSelected_ = function(node) {
      if (node === this.tree_) {
        return false;
      }
      // if (this.lastCategory_) {
      //   this.lastCategory_.getRowElement().style.backgroundColor = '';
      // }
      if (node) {
        // const hexColour = node.hexColour || '#57e';
        // node.getRowElement().style.backgroundColor = hexColour;
        // Add colours to child nodes which may have been collapsed and thus
        // not rendered.
        // this.addColour_(node);
      }
      return true;
    };

    Blockly.tree.BaseNode.prototype.getRowClassName = function() {
      let selectedClass = '';
      if (this.isSelected()) {
       selectedClass = ' ' + (this.config_.cssSelectedRow || '');
      }
      return this.config_.cssTreeRow + selectedClass;
    };

    Blockly.tree.BaseNode.prototype.getRowDom = function() {
      const row = document.createElement('div');
      row.className = this.getRowClassName();
      row.style['padding-' + (this.isRightToLeft() ? 'right' : 'left')] =
          this.getPixelIndent_() + 'px';
      const label = this.getLabelDom();
      row.appendChild(this.getIconDom());
      row.appendChild(label);
      if (label.textContent) {
        const img = document.createElement('img');
        img.src = 'https://ng.ant.design/assets/img/logo.svg';
        img.style.height = '32px';
        img.style.display = 'block';
        img.style.margin = '0 auto 4px';
        label.parentNode.insertBefore(img, label);
      }
      return row;
    };

    Blockly.tree.BaseNode.prototype.getLabelDom = function() {
      const label = document.createElement('span');
      label.className = this.config_.cssItemLabel || '';
      label.textContent = this.getText();
      return label;
    };

    // Blockly.utils.dom.createSvgElement = function(name, attrs, parent) {
    //   console.log(name, attrs, parent);
    //   const e = /** @type {!SVGElement} */
    //   (document.createElementNS(Blockly.utils.dom.SVG_NS, name));
    //   console.log(e);
    //   for (const key in attrs) {
    //     if (key) {
    //       e.setAttribute(key, attrs[key]);
    //     }
    //   }
    //   if (parent) {
    //     parent.appendChild(e);
    //   }
    //   return e;
    // };

    Blockly.blockRendering.ConstantProvider.prototype.makePuzzleTab = function() {
      const width = this.TAB_WIDTH;
      const height = this.TAB_HEIGHT;

      // 拼图选项卡的main path主要有几个curves(c and s) 组成
      // Those curves are defined with relative positions.  The 'up' and 'down'
      // versions of the paths are the same, but the Y sign flips.  Forward and back
      // are the signs to use to move the cursor in the direction that the path is
      // being drawn.
      function makeMainPath(up) {
        const forward = up ? -1 : 1;
        const back = -forward;

        const overlap = 2.5;
        const halfHeight = height / 2;
        const control1Y = halfHeight + overlap;
        const control2Y = halfHeight + 0.5;
        const control3Y = overlap; // 2.5

        const endPoint1 = Blockly.utils.svgPaths.point(-width, forward * halfHeight);
        const endPoint2 = Blockly.utils.svgPaths.point(width, forward * halfHeight);

        return Blockly.utils.svgPaths.curve('c',
            [
              Blockly.utils.svgPaths.point(0, forward * control1Y),
              Blockly.utils.svgPaths.point(-width, back * control2Y),
              endPoint1
            ]) +
            Blockly.utils.svgPaths.curve('s',
                [
                  Blockly.utils.svgPaths.point(width, back * control3Y),
                  endPoint2
                ]);
      }

      // c 0,-10  -8,8  -8,-7.5  s 8,2.5  8,-7.5
      const pathUp = makeMainPath(true);
      // c 0,10  -8,-8  -8,7.5  s 8,-2.5  8,7.5
      const pathDown = makeMainPath(false);
      console.log({
        width,
        height,
        pathDown,
        pathUp
      });
      return {
        width,
        height,
        pathDown,
        pathUp
      };
    };

    Blockly.Mutator.prototype.createEditor_ = function() {
      /* Create the editor.  Here's the markup that will be generated:
      <svg>
        [Workspace]
      </svg>
      */
      this.svgDialog_ = Blockly.utils.dom.createSvgElement('svg',
          {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
          null);
      console.log(this.quarkNames_);
      // Convert the list of names into a list of XML objects for the flyout.
      if (this.quarkNames_.length) {
        var quarkXml = Blockly.utils.xml.createElement('xml');
        for (var i = 0, quarkName; quarkName = this.quarkNames_[i]; i++) {
          var element = Blockly.utils.xml.createElement('block');
          element.setAttribute('type', quarkName);
          quarkXml.appendChild(element);
        }
      } else {
        var quarkXml = null;
      }
      var workspaceOptions = {
        // If you want to enable disabling, also remove the
        // event filter from workspaceChanged_ .
        disable: false,
        disabledPatternId: this.block_.workspace.options.disabledPatternId,
        languageTree: quarkXml,
        parentWorkspace: this.block_.workspace,
        pathToMedia: this.block_.workspace.options.pathToMedia,
        RTL: this.block_.RTL,
        toolboxPosition: this.block_.RTL ? Blockly.TOOLBOX_AT_RIGHT :
            Blockly.TOOLBOX_AT_LEFT,
        horizontalLayout: false,
        getMetrics: this.getFlyoutMetrics_.bind(this),
        setMetrics: null,
        renderer: this.block_.workspace.options.renderer
      };
      this.workspace_ = new Blockly.WorkspaceSvg(workspaceOptions);
      this.workspace_.isMutator = true;
      this.workspace_.addChangeListener(Blockly.Events.disableOrphans);

      // Mutator flyouts go inside the mutator workspace's <g> rather than in
      // a top level svg. Instead of handling scale themselves, mutators
      // inherit scale from the parent workspace.
      // To fix this, scale needs to be applied at a different level in the dom.
      var flyoutSvg = this.workspace_.addFlyout_('g');
      var background = this.workspace_.createDom('blocklyMutatorBackground');

      // Insert the flyout after the <rect> but before the block canvas so that
      // the flyout is underneath in z-order.  This makes blocks layering during
      // dragging work properly.
      background.insertBefore(flyoutSvg, this.workspace_.svgBlockCanvas_);
      this.svgDialog_.appendChild(background);

      return this.svgDialog_;
    };

    Blockly.Xml.domToField_ = function(block, fieldName, xml) {
      console.log(xml);
      console.log(block);
      console.log(fieldName);
      var field = block.getField(fieldName);
      if (!field) {
        console.warn('Ignoring non-existent field ' + fieldName + ' in block ' +
            block.type);
        return;
      }
      field.fromXml(xml);
    };

  }
}
