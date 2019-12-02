import { Injectable, Renderer2, ElementRef, RendererFactory2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category, XmlBlock } from 'ngx-blockly';
import { NzModalService } from 'ng-zorro-antd';
import { map } from 'rxjs/operators';
import { VariableGetBlock, CustomLabel, AndOrBlock } from 'projects/my-lib/src/public-api';
import { of } from 'rxjs';
declare var Blockly: any;

export const LOGIC_CATEGORY: Category = new Category([
  new AndOrBlock('logic_block_self_add', null, null),
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

@Injectable()

export class BlocklyService {
  constructor(private http: HttpClient,
              private modalService: NzModalService) {
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

  /**
   *  获取标签（变量）,并生成block及其javascript方法
   */
  getVariables(path?: string) {
    return this.http.get(path || 'assets/blockly/variables/variables.json', {}).pipe(
      map((rsp: any) => {
        const tempBlocks = [];
        const variables = rsp.variables || [];
        for (let i = 0, len = variables.length; i < len; i++) {
          const temp = {
            type: `variables_get_${variables[i].key}` ,
            message0: '%1',
            args0: [
              {
                type: 'field_variable',
                name: 'VAR',
                variable:  variables[i].value || 'item',
                variableTypes: [variables[i].type],    // Specifies what types to put in the dropdown
                defaultType:  variables[i].type
              }
            ],
            colour: '%{BKY_LOGIC_HUE}',
            output:  variables[i].type || null,    // Returns a value of 'Panda'
          };
          tempBlocks.push(
            new VariableGetBlock(`variables_get_${variables[i].key}`, null, null, variables[i].value, [variables[i].type], variables[i].type, variables[i].key)
          );
          Blockly.Blocks[`variables_get_${variables[i].key}` ] = {
            init() {
              this.jsonInit(temp);
            }
          };
          Blockly.JavaScript[`variables_get_${variables[i].key}`] = () => {
            return [variables[i].value, Blockly.JavaScript.ORDER_NONE];
          };
        }
        return tempBlocks;
      })
    );
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
            const input = this.appendValueInput(`NAME${i}`).setCheck('Boolean');
            if (i === 1) {
              input.appendField(new Blockly.FieldDropdown([['且', '&&'], ['或', '||']]), 'NAME');
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
    // 目录左侧的颜色条
    Blockly.Toolbox.prototype.addColour_ = () => {};
    // 给选中的条目加上背景色
    Blockly.Toolbox.prototype.handleBeforeTreeSelected_ = function(node) {
      if (node === this.tree_) {
        return false;
      }
      if (node) {
        // const hexColour = node.hexColour || '#57e';
        // node.getRowElement().style.backgroundColor = hexColour;
        // Add colours to child nodes which may have been collapsed and thus
        // not rendered.
        // this.addColour_(node);
      }
      return true;
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
        const img = document.createElement('img');
        img.src = 'https://ng.ant.design/assets/img/logo.svg';
        img.style.height = '32px';
        img.style.display = 'block';
        img.style.margin = '0 auto 4px';
        label.parentNode.insertBefore(img, label);
      }
      return row;
    };

    // 更新input,和output的卡槽形状
    // Blockly.blockRendering.ConstantProvider.prototype.makePuzzleTab = function() {
    //   const width = this.TAB_WIDTH;
    //   const height = this.TAB_HEIGHT;

    //   return {
    //     width,
    //     height,
    //     pathDown: 'a 4 4 90 1 0 0,16',
    //     pathUp:  'a 4 4 90 1 1 0,-16'
    //   };
    // };

  }

  /**
   * 在toolbox目录上方插入搜索框，并resize()
   */
  insertSearchInputIntoToolbox(render2: Renderer2, ele: ElementRef, workspace: any) {
    const treeRoot =  ele.nativeElement.querySelector('.blocklyToolboxDiv');
    const searchInput =  ele.nativeElement.querySelector('.ant-input-affix-wrapper');
    render2.setStyle(searchInput, 'display', 'block');
    render2.insertBefore(treeRoot, searchInput, ele.nativeElement.querySelector('.blocklyTreeRoot'));
    workspace.workspace.resize();
  }

  /**
   * 根据名称搜索block，并且创建一个目录，将搜索结果放入其中
   */
  searchBlockByName(keyWords: string, workspace: any, ngxToolboxBuilder: any) {
    const nodes = ngxToolboxBuilder._nodes;
    const result = [];
    for (let i = 0, len = nodes.length; i < len; i ++) {
      if (nodes[i] instanceof Category) {
        const blocks = nodes[i].blocks || [];
        for (let j = 0, len2 = blocks.length; j < len2; j ++) {
          const variablesName = ((blocks[j].args || [])[0] || '') + ((blocks[j].args || [])[3] || ''); // 变量的中文+英文名
          if (variablesName.includes(keyWords)) {
            result.push(blocks[j]);
          }
        }
      }
    }
    const toolbox = ngxToolboxBuilder.build();
    const ifExistSearchResultCategory = toolbox.includes('查询结果');
    if (keyWords) {
      if (!ifExistSearchResultCategory) {
        if (result && result.length > 0) {
          ngxToolboxBuilder.nodes.unshift(new Category([
            ...result
          ], '#ff00ff', '查询结果', null));
        } else {
          ngxToolboxBuilder.nodes.unshift(new Category([
            new CustomLabel('暂无搜索结果')
          ], '#ff00ff', '查询结果', null));
        }
      }
      workspace.workspace.updateToolbox(ngxToolboxBuilder.build());
      workspace.workspace.getToolbox().selectFirstCategory();
    } else {
      if (ifExistSearchResultCategory) {
        ngxToolboxBuilder.nodes.shift();
        workspace.workspace.updateToolbox(ngxToolboxBuilder.build());
        workspace.workspace.getToolbox().selectFirstCategory();
      }
    }
    return of();
  }
}
