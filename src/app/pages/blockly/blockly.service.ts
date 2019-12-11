import { Injectable, Renderer2, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomBlock, NgxBlocklyConfig, NgxBlocklyComponent } from 'ngx-blockly';
import { map } from 'rxjs/operators';
import { VariableGetBlock, ValuesDropDownBlock } from 'my-lib';
import { of, Subscription, Observable, zip } from 'rxjs';
import { generateColor } from 'my-lib';
declare var Blockly: any;
@Injectable()

export class BlocklyService {
  loadedVariables = new Set(); // 存储已加载的变量block的type
  categorySearch = '<category colour="#000" name="查询结果">';
  workspace: NgxBlocklyComponent;
  categoriesInString = ''; // 远程加载的目录结构string表示
  categoriesInArray = [];
  categoriesInObject = {};
  variables: CustomBlock[] = []; // 当前toolbox中包含的变量
  subscription$ = new Subscription();
  constructor(private http: HttpClient) {
  }

  clear() {
    this.subscription$.unsubscribe();
    this.workspace = null;
    this.categoriesInString = '';
    this.categoriesInArray = [];
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
  getVariables(id: string): Observable<any[]> {
    return this.http.get('assets/blockly/variables/variables.json', {}).pipe(
      map((rsp: any) => {
        const tempBlocks = [];
        const variables = rsp.variables[id] || [];
        let xmls = '';
        for (let i = 0, len = variables.length; i < len; i++) {
          this.loadedVariables.add(`${variables[i].key}#${variables[i].value}`);
          const tempVariable =  new VariableGetBlock(`${variables[i].key}`, null, null, variables[i].value, [variables[i].type], variables[i].key);
          this.initVariableBlock(tempVariable);
          xmls += tempVariable.toXML();
          tempBlocks.push(
            tempVariable
          );
        }
        return [tempBlocks, xmls];
      })
    );
  }

  getDropDown(id: string): Observable<any[]> {
    return this.http.get('assets/blockly/labels/labels.json', {}).pipe(
      map((rsp: any) => {
        const tempBlocks = [];
        const labels = (rsp.labels[id] || {}).values || [];
        const key =  (rsp.labels[id] || {}).key;
        let xmls = '';
        if (labels.length > 0) {
          const tempVariable =  new ValuesDropDownBlock(`dropdown_${id}`, null, null, `extension_${id}`, key);
          try {
            Blockly.Extensions.register(`extension_${id}`,
              function() {
                this.getInput('INPUT')
                  .appendField(new Blockly.SelfSelectorField(labels));
              });
          } catch (error) {
          }
          this.initVariableBlock(tempVariable);
          xmls += tempVariable.toXML();
          tempBlocks.push(
            tempVariable
          );
        }
        return [tempBlocks, xmls];
      })
    );
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
    // Blockly.Toolbox.prototype.addColour_ = () => {};
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
        // Add colours to child nodes which may have been collapsed and thus
        // not rendered.
        this.addColour_(node);
      }
      return true;
    };

    Blockly.Toolbox.prototype.loadVariable = (node) => {
      // console.log(node.hexColour);
      const categoryName = node.content_;
      const selectedCategoryes = this.categoriesInArray.filter(item => item.name === categoryName);
      const categoryId = ((selectedCategoryes || [])[0] || {}).id;
      if (categoryId && node.blocks.length === 0 && categoryName !== '查询结果') {
        // 异步加载blocks
        const zip$ = zip(this.getVariables(categoryId), this.getDropDown(categoryId)).subscribe(rsp => {
          const treeControl = this.workspace.workspace.getToolbox().tree_; // 每次调用renderTree都会生成新的TreeControl
          const preSelectedItem = treeControl.getSelectedItem();
          if (rsp[0][1]) {
            const xml = Blockly.Xml.textToDom(`<xml>
            <label text="${categoryName}-变量"></label>
            ${rsp[0][1]}
            <label text="${categoryName}-值"></label>
            ${rsp[1][1]}
            </xml>`);
            preSelectedItem.blocks.push(...xml.children);
            this.workspace.workspace.getToolbox().refreshSelection();
          }
        });
        this.subscription$.add(zip$);
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
          icon.innerHTML = `
          <i _ngcontent-vvd-c1="" nz-icon="" nztheme="outline" nztype="down" class="anticon anticon-down" ng-reflect-nz-type="down" ng-reflect-nz-theme="outline">
          <svg viewBox="64 64 896 896" fill="currentColor" width="1em" height="1em" data-icon="down" aria-hidden="true">
          <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3
           7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path>
          </svg>
          </i>`;
          icon.style.flexGrow = '1';
          icon.style.display = 'flex';
          icon.style.justifyContent = 'flex-end';
          label.parentNode.appendChild(icon);
        }
        const img = document.createElement('img');
        // <i nz-icon nzType="down" nzTheme="outline"></i>
        img.src = this.getCategoryConfig(label.textContent).itemImg.commonUrl;
        img.style.height = '24px';
        img.style.margin = '0 10px 0 8px';
        label.parentNode.insertBefore(img, label);
      }
      return row;
    };

    Blockly.tree.BaseNode.prototype.getCategoryConfig = (labelContext: string) => {
      let commonUrl: string;
      let activeUrl: string;
      switch (labelContext) {
        case '查询结果':
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
          commonUrl = (this.categoriesInObject[labelContext] || {}).commonUrl || ' https://ng.ant.design/assets/img/logo.svg';
          activeUrl =  (this.categoriesInObject[labelContext] || {}).activeUrl || 'https://www.primefaces.org/primeng/assets/showcase/images/mask.svg';
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

    Blockly.tree.BaseNode.prototype.getIconElement = function() {
      const el = this.getRowElement();
      return el ? (el.lastChild) : null;
    };

    // 选中元素增加class类
    Blockly.tree.BaseNode.prototype.getRowClassName = function() {
      let selectedClass = '';
      if (this.isSelected()) {
        selectedClass = ' ' + (this.config_.cssSelectedRow || '') + ' ' + 'app-blockly-selected ';
      }
      return this.config_.cssTreeRow + selectedClass;
    };

    // 控制目录展开闭合的图标
    Blockly.tree.TreeNode.prototype.getCalculatedIconClass = function() {
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

    // 更新input,和output的卡槽形状
    // Blockly.blockRendering.ConstantProvider.prototype.makePuzzleTab = function() {
    //   const width = this.TAB_WIDTH;
    //   const height = this.TAB_HEIGHT;
    //   return {
    //     width,
    //     height,
    //     pathDown: 'a 4 4 90 1 0 0,15',
    //     pathUp:  'a 4 4 90 1 1 0,-15'
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
  searchBlockByName(keyWords: string, workspace: NgxBlocklyComponent) {
    let result = '' ;
    this.loadedVariables.forEach((item: string) => {
      const temp =  item.split('#');
      const type = temp[0];
      const value = temp[1];
      if (value.indexOf(keyWords) > -1) {
        result += `<block type='${type}'></block>`;
      }
    });

    const toolbox = workspace.config.toolbox;
    const ifExistSearchResultCategory = toolbox.includes('查询结果');
    if (keyWords) {
      if (!ifExistSearchResultCategory) {
        if (result) {
          workspace.config.toolbox = toolbox.replace('<xml id="toolbox" style="display: none">',
      '<xml id="toolbox" style="display: none">' + `${this.categorySearch}${result}</category>`);
        } else {
          workspace.config.toolbox = toolbox.replace('<xml id="toolbox" style="display: none">',
          '<xml id="toolbox" style="display: none">' + `${this.categorySearch}<label text="暂无查询结果"></label></category>`);
        }
      }
      workspace.workspace.updateToolbox(workspace.config.toolbox);
      workspace.workspace.getToolbox().selectFirstCategory();
    } else {
      if (ifExistSearchResultCategory) {
        const categorySearchStartIndex = toolbox.indexOf(this.categorySearch);
        const categorySearchEndIndex = toolbox.indexOf('</category>', categorySearchStartIndex) + 11;
        workspace.config.toolbox = toolbox.slice(0, categorySearchStartIndex) + toolbox.slice(categorySearchEndIndex);
        workspace.workspace.updateToolbox(workspace.config.toolbox);
        workspace.workspace.getToolbox().flyout_.hide();
      }
    }
    return of();
  }

  /**
   *  加载目录
   */
  loadCategories(config: NgxBlocklyConfig, workspace: NgxBlocklyComponent) {
    return this.http.get('assets/blockly/categorys/categorys.json', {}).pipe(map((rsp: any) => {
      const categories = rsp.categories;
      this.jsonToXml(categories);
      config.toolbox = config.toolbox.replace('<xml id="toolbox" style="display: none">',
      '<xml id="toolbox" style="display: none">' + this.categoriesInString);
      workspace.workspace.updateToolbox(config.toolbox);
    }));
  }

  /**
   *  toolbox json格式转xml字符串 及数组
   */
  jsonToXml(categoryes: any[] = []) {
    for (let i = 0, len = categoryes.length ; i < len; i++) {
      this.categoriesInArray.push({
        id: categoryes[i].id,
        name: categoryes[i].name,
        parentId: categoryes[i].parentId,
      });
      if (categoryes[i].name) {
        this.categoriesInObject[categoryes[i].name] = {
          commonUrl: categoryes[i].commonUrl,
          activeUrl: categoryes[i].activeUrl
        };
      }
      this.categoriesInString += `<category class="form-ajax" name="${categoryes[i].name}" colour="${categoryes[i].color || generateColor()}">`;
      const children = categoryes[i].children || [];
      if (children.length > 0) {
        this.jsonToXml(children);
      }
      this.categoriesInString += '</category>';
    }
  }

  /**
   *  解析xml并加载其中的block
   */
  parseXmlAndInitBlock(result: string) {
    const tags = [];
    const labels = [];
    let variableStart = 0;
    let variableEnd = 0;
    let labelStart = 0;
    let labelEnd = 0;
    while (variableStart !== -1) {
      variableStart = result.indexOf('<block type="variables_get', variableEnd);
      if (variableStart !== -1) {
        variableEnd = result.indexOf('</block>', variableStart) + 7;
        tags.push(result.slice(variableStart, variableEnd).replace(/\s*/g, ''));
      }
    }
    const variables = [];
    tags.forEach(tag => {
      const temp = tag.indexOf('type="');
      const typeIndx = tag.indexOf('variabletype="') ;

      variables.push({
        key: tag.slice(temp + 6, tag.indexOf('"', temp + 6)),
        type: tag.slice(typeIndx + 14, tag.indexOf('"', typeIndx + 14)),
        value: tag.slice(tag.indexOf('>', typeIndx + 14) + 1, tag.indexOf('<', typeIndx + 14))
      });
    });
    variables.forEach(variable => {
      if (!Blockly.Blocks[variable.key]) {
        const temp = new VariableGetBlock(variable.key, null, null, variable.value, [variable.type], variable.key);
        this.initVariableBlock(temp);
      }
    });
  }

  /**
   * 初始化变量的block并实现其js方法
   */
  initVariableBlock(block: CustomBlock) {
    // tslint:disable-next-line: no-string-literal
    const jsonBLock = block['jsonBlock'];
    if (!block.type || !jsonBLock ) {
      return;
    }
    Blockly.Blocks[block.type] = {
      init() {
        this.jsonInit(jsonBLock);
      }
    };
    Blockly.JavaScript[block.type] = (e: any) => {
      return block.toJavaScriptCode(e);
    };
  }

}
