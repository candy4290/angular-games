import { Injectable, Renderer2, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category, CustomBlock } from 'ngx-blockly';
import { NzModalService } from 'ng-zorro-antd';
import { map } from 'rxjs/operators';
import { VariableGetBlock, CustomLabel } from 'projects/my-lib/src/public-api';
import { of } from 'rxjs';
declare var Blockly: any;

@Injectable()

export class BlocklyService {
  variables: CustomBlock[] = []; // 当前toolbox中包含的变量
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
        let xmls = '';
        for (let i = 0, len = variables.length; i < len; i++) {
          const tempVariable =  new VariableGetBlock(`variables_get_${variables[i].key}`, null, null, variables[i].value, [variables[i].type], variables[i].type, variables[i].key);
          xmls += tempVariable.toXML();
          tempBlocks.push(
            tempVariable
          );
          Blockly.Blocks[tempVariable.type] = {
            init() {
              this.jsonInit(tempVariable.jsonBlock);
            }
          };
          Blockly.JavaScript[tempVariable.type] = (e: any) => {
            return tempVariable.toJavaScriptCode(e);
          };
        }
        return [tempBlocks, xmls];
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
        // Add colours to child nodes which may have been collapsed and thus
        // not rendered.
        this.addColour_(node);
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
        img.src = this.getCategoryConfig(label.textContent).itemImg.commonUrl;
        img.style.height = '32px';
        img.style.display = 'block';
        img.style.margin = '0 auto 4px';
        label.parentNode.insertBefore(img, label);
      }
      return row;
    };

    Blockly.tree.BaseNode.prototype.getCategoryConfig = function(labelContext: string) {
      let commonUrl: string;
      let activeUrl: string;
      switch (labelContext) {
        case '查询结果':
          commonUrl = 'https://ng.ant.design/assets/img/logo.svg';
          activeUrl = 'https://ng.ant.design/assets/img/logo.svg';
          break;
        case '变量':
        case '逻辑':
        case '循环':
        case '数学':
        case '文本':
        case '列表':
          commonUrl = 'https://ng.ant.design/assets/img/logo.svg';
          activeUrl = 'https://www.primefaces.org/primeng/assets/showcase/images/mask.svg';
          break;
        default:
          commonUrl = 'https://ng.ant.design/assets/img/logo.svg';
          activeUrl = 'https://ng.ant.design/assets/img/logo.svg';
      }
      return {
        itemImg: {
          commonUrl, activeUrl
        },
        itemColor: {

        },
        itemBackgroundColor: {

        }
      };
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

    // HTML标签转化为Block对象
    // Blockly.Xml.domToBlock
    // blockToDom ---- Block对象转化为HTML标签

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
        workspace.workspace.getToolbox().flyout_.hide();
      }
    }
    return of();
  }
}
