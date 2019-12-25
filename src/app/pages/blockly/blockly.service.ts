import { Injectable, Renderer2, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomBlock, NgxBlocklyConfig, NgxBlocklyComponent } from 'ngx-blockly';
import { map, tap } from 'rxjs/operators';
import { VariableGetBlock, ValuesDropDownBlock } from 'my-lib';
import { of, Subscription, Observable, zip } from 'rxjs';
import { generateColor } from 'my-lib';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { RenameVariableComponent } from './rename-variable/rename-variable.component';
import * as xml2js from 'xml2js';

declare var Blockly: any;
@Injectable()

export class BlocklyService {
  searchResult: HTMLElement; // 搜索结果dom元素
  loadedVariables = new Set(); // 存储已加载的变量block的type
  workspace: NgxBlocklyComponent;
  categoriesInString = ''; // 远程加载的目录结构string表示
  categoriesInArray = [];
  categoriesInObject = {};
  variables: CustomBlock[] = []; // 当前toolbox中包含的变量
  subscription$ = new Subscription();
  constructor(private http: HttpClient,
              private modalService: NzModalService,
              private nzMessageService: NzMessageService) {
  }

  clear() {
    this.subscription$.unsubscribe();
    this.searchResult = null;
    this.categoriesInString = '';
    this.categoriesInArray = [];
    // 卸载已经注册的extensions和fieldRegistry,或者使用try catch
    Blockly.Extensions.unregister('blockly_self_add_mutator');
    Blockly.fieldRegistry.unregister('self-selector');
    Blockly.utils.IdGenerator.nextId_ = 0;
    this.workspace.workspace.dispose();
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
   *  获取标签值（自动生成变量）,并生成block及其javascript方法
   */
  getDropDown(code: string, name: string, categoryColor: string): Observable<any[]> {
    return this.http.put('http://10.19.248.200:31082/api/v1/tag/children', {
      name,
      code
    }).pipe(
      map((rsp: any) => {
        const tempBlocksKey = [];
        const tempBlocksValue = [];
        const labels = (rsp.results  || []).map((item: any) => [item.name, item.name]);
        let xmlsKey = '';
        let xmlsValue = '';
        if (labels.length > 0) {
          // 创建变量
          const variableBlockType = `variables_get_${code}__${name}__${categoryColor}`;
          this.loadedVariables.add(variableBlockType);
          const tempVariableKey =  new VariableGetBlock(variableBlockType, null, null, name, code, categoryColor);
          this.initVariableBlock(tempVariableKey);
          xmlsKey += tempVariableKey.toXML();
          tempBlocksKey.push(
            tempVariableKey
          );
          // 创建值下拉列表 dropdown__父节点code__父节点name__父节点选中后的颜色
          const tempVariable =  new ValuesDropDownBlock(`dropdown__${code}__${name}__${categoryColor}`, null, null, `extension_${code}`, code, categoryColor);
          try {
            Blockly.Extensions.register(`extension_${code}`,
              function() {
                this.getInput('INPUT')
                .appendField(new Blockly.SelfSelectorField(labels), 'NAME');
              });
            } catch (error) {
          }
          this.initVariableBlock(tempVariable);
          xmlsValue += tempVariable.toXML();
          tempBlocksValue.push(
            tempVariable
          );
        }
        return [[tempBlocksKey, xmlsKey], [tempBlocksValue, xmlsValue]];
      })
    );
  }

  /**
   * 加载mutator中使用到的block,这些block不需要转化为代码，只是用来构造source block的结构（例如增删inputs数量）
   */
  loadBlockInMutator() {
    // tslint:disable-next-line: no-string-literal
    if (!Blockly.Blocks['block_self_boolean'] || !Blockly.Blocks['block_self_mutator']) {
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
    }
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
   * 更改Blockly默认样式
   */
  changeBlocklyDefaultStyle() {
    // 异步加载目录下的block,使用refreshSelection动态更新flyout中的block
    Blockly.Toolbox.prototype.loadVariable = (node) => {
      const categoryColor = node.hexColour;
      const categoryName = node.content_;
      const selectedCategoryes = this.categoriesInArray.filter(item => item.name === categoryName);
      const categoryId = ((selectedCategoryes || [])[0] || {}).code;
      if (categoryId && node.blocks.length === 0 && categoryName !== '查询结果') {
        // 异步加载blocks
        const zip$ = this.getDropDown(categoryId, categoryName, categoryColor).subscribe(rsp => {
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

    // 获取目录的配置文件（选中的图标+未选中时的图标）
    Blockly.tree.BaseNode.prototype.getCategoryConfig = (labelContext: string) => {
      let commonUrl: string;
      let activeUrl: string;
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

    // 覆盖默认的prompt弹窗
    Blockly.prompt = (message, defaultValue, callback) => {
      this.modalService.create({
        nzTitle: message,
        nzContent: RenameVariableComponent,
        nzComponentParams: {
          defaultValue
        },
        nzOnOk: (e) => {
          const newName = e.renameVariableForm.get('variableName').value;
          callback(newName);
        }
      });
    };

    // 覆盖默认confirm弹窗
    Blockly.confirm = (message, callback) => {
      this.modalService.create({
        nzTitle: '删除',
        nzContent: message,
        nzOnOk: () => { callback(true); }
      });
    };

  }

  /**
   * 在toolbox目录上方插入搜索框，并resize()
   */
  insertSearchInputIntoToolbox(render2: Renderer2, ele: ElementRef) {
    const treeRoot =  ele.nativeElement.querySelector('.blocklyToolboxDiv');
    const searchInput =  ele.nativeElement.querySelector('.ant-input-affix-wrapper');
    render2.setStyle(searchInput, 'display', 'block');
    render2.insertBefore(treeRoot, searchInput, ele.nativeElement.querySelector('.blocklyTreeRoot'));
    this.workspace.workspace.resize();
  }

  /**
   * 根据名称搜索block，并且创建一个目录，将搜索结果放入其中
   */
  searchBlockByName(keyWords: string) {
    let result = '' ;
    const toolbox = this.workspace.workspace.getToolbox();
    this.loadedVariables.forEach((item: string) => {
      const temp =  item.split('__');
      const value = temp[1];
      if (value.indexOf(keyWords) > -1) {
        result += `<block type='${item}'></block>`;
      }
    });

    const ifExistSearchResultCategory = (this.searchResult.style.display !== 'none');
    if (keyWords) {
      if (!ifExistSearchResultCategory) {
        if (!result) {
          result += '<label text="暂无查询结果"></label>';
        }
      }
      this.searchResult.style.display = 'block';
      toolbox.clearSelection(); // 清除选中状态
      toolbox.selectFirstCategory(); // 选中’查询结果‘
      const treeControl = toolbox.tree_; // 每次调用renderTree都会生成新的TreeControl
      const preSelectedItem = treeControl.getSelectedItem();
      const xml = Blockly.Xml.textToDom(`<xml>
      ${result}
      </xml>`);
      preSelectedItem.blocks = xml.children;
      toolbox.refreshSelection();
    } else {
      if (ifExistSearchResultCategory) {
        this.searchResult.style.display = 'none';
        toolbox.flyout_.hide();
      }
    }
    return of();
  }

  /**
   *  加载目录
   */
  loadCategories(config: NgxBlocklyConfig) {
    return zip(
      this.http.put('http://10.19.248.200:31082/api/v1/tag/system_tree', {}),
      this.http.put('http://10.19.248.200:31082/api/v1/tag/custom_tree', {}),
    )
    .pipe(map((rsp: any) => {
      const categories = [rsp[0].result || [], rsp[1].result || []];
      this.jsonToXml(categories);
      this.categoriesInString = '<category name="查询结果"></category>' + this.categoriesInString;
      config.toolbox = config.toolbox.replace('<xml id="toolbox" style="display: none">',
      '<xml id="toolbox" style="display: none">' + this.categoriesInString);
      this.workspace.workspace.updateToolbox(config.toolbox);
      this.searchResult = <HTMLElement>document.getElementsByClassName('blocklyTreeRoot').item(0).lastChild.lastChild.firstChild;
      this.searchResult.style.display = 'none';
    }));
  }

  /**
   *  toolbox json格式转xml字符串 及数组
   */
  jsonToXml(categoryes: any[] = []) {
    for (let i = 0, len = categoryes.length ; i < len; i++) {
      this.categoriesInArray.push({
        code: categoryes[i].code,
        name: categoryes[i].name,
        parent: categoryes[i].parent,
      });
      if (categoryes[i].name) {
        this.categoriesInObject[categoryes[i].name] = {
          commonUrl: categoryes[i].commonUrl,
          activeUrl: categoryes[i].activeUrl
        };
      }
      this.categoriesInString += `<category name="${categoryes[i].name}" colour="${categoryes[i].color || generateColor()}">`;
      const children = categoryes[i].tagClassChildren || [];
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
    const rxs = [];
    const tags = [];
    let variableStart = 0;
    let variableEnd = 0;

    const labels = [];
    let labelStart = 0;
    let labelEnd = 0;

    while (variableStart !== -1) {
      variableStart = result.indexOf('<block type="variables_get', variableEnd);
      if (variableStart !== -1) {
        variableEnd = result.indexOf('</block>', variableStart) + 8;
        tags.push(result.slice(variableStart, variableEnd).replace(/\s*/g, ''));
      }
    }
    const variables = [];
    tags.forEach(tag => {
      const temp = tag.indexOf('type="');
      const typeIndx = tag.indexOf('variabletype="') ;
      const blockType = tag.slice(temp + 6, tag.indexOf('"', temp + 6));
      const types = blockType.split('__');
      const variableType = tag.slice(typeIndx + 14, tag.indexOf('"', typeIndx + 14));
      variables.push({
        key: blockType,
        type: variableType,
        value: types[2],
        categoryColour: types[1]
      });
    });
    variables.forEach(variable => {
      if (!Blockly.Blocks[variable.key]) {
        const temp = new VariableGetBlock(variable.key, null, null, variable.value, variable.type, variable.categoryColour);
        this.initVariableBlock(temp);
      }
    });

    while (labelStart !== -1) {
      labelStart = result.indexOf('<block type="dropdown__', labelEnd);
      if (labelStart !== -1) {
        labelEnd = result.indexOf('</block>', labelStart) + 8;
        labels.push(result.slice(labelStart, labelEnd).replace(/\s*/g, ''));
      }
    }
    const dropdownValues = [];
    labels.forEach(label => {
      const blockTypeStart = label.indexOf('type="');
      const blockTypeEnd =  label.indexOf('"', blockTypeStart + 6);
      const temps = label.slice(blockTypeStart, blockTypeEnd).split('__');
      // dropdownValues去重；
      if (dropdownValues.findIndex(item => item.code === temps[1]) === -1) {
        dropdownValues.push({
          code: temps[1],
          name: temps[2],
          categoryColour: temps[3]
        });
      }
    });
    dropdownValues.forEach(item => {
      // dropdown__父节点code__父节点name__父节点选中后的颜色
      const dropdownBlockType = `dropdown__${item.code}__${item.name}__${item.categoryColour}`;
      if (!Blockly.Blocks[dropdownBlockType]) {
        const tempVariable =  new ValuesDropDownBlock(dropdownBlockType,
        null, null, `extension_${item.code}`, item.code, item.categoryColour);
        // 获取labels注册extension
        const temp$ = this.http.put('http://10.19.248.200:31082/api/v1/tag/children', {
          code: item.code,
          name: item.name
        }).pipe(tap((rsp: any) => {
          // tslint:disable-next-line: no-shadowed-variable
          const labels = (rsp.results  || []).map((item: any) => [item.name, item.name]);
          try {
            Blockly.Extensions.register(`extension_${item.code}`,
                function() {
                  this.getInput('INPUT')
                    .appendField(new Blockly.SelfSelectorField(labels), 'NAME');
                });
          } catch {}
          this.initVariableBlock(tempVariable);
        }));
        rxs.push(temp$);
      }
    });
    if (rxs.length > 0) {
      return zip(...rxs);
    } else {
      return of({});
    }
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

  /**
   * 将xml转为后端想要的数据
   * @param {string} xml
   * @returns
   * @memberof BlocklyService
   */
  parseToBackend(xml: string) {
    const result: any = {};
    xml2js.parseString(xml, (err: any, r: any) => {
      const sourceBlocks = r.xml.block;
      if (!sourceBlocks) {
        return;
      }
      if (sourceBlocks && sourceBlocks.length > 1) {
       console.warn('请将多个表达式组合成一个表达式');
       return;
      }
      const sourceBlockType = sourceBlocks[0].$.type;
      if (sourceBlockType !== 'logic_block_self_add' && sourceBlockType !== 'logic_compare' && sourceBlockType !== 'logic_operation') {
        console.warn('这不是一个表达式!');
        return;
      }
      if (!sourceBlocks[0].value) {
        console.warn('这是一个空表达式!');
        return;
      }
      result.name = '江苏可疑人员';
      result.ruleTermName = '江苏可疑人员';
      result.description = '找出出生地为江苏的满足一定条件的可疑人员';
      result.ruleTermNode = {
        name: '江苏可疑人员',
        operator: sourceBlocks[0].field[0]._ === 'OR' ? 'OR' : 'AND',
        type: 'GROUP',
        content: xml,
        subs: this.generateSubs(sourceBlocks[0].value, sourceBlocks[0].$.type)
      };
    });
    return result;
  }

  generateSubs(values: any[], type?: string) {
    const result = [];
    if (type === 'logic_compare') {
      result.push({
        name: (values || [])[1] ? values[1].block[0].field[0]._ : '',
        operator: 'SINGLE',
        type: 'TAG',
        subs: []
      });
    } else {
      values.forEach(value => {
        if (value.block[0].$.type === 'logic_compare') {
          result.push({
            name: (value.block[0].value || [])[1] ? value.block[0].value[1].block[0].field[0]._ : '',
            operator: 'SINGLE',
            type: 'TAG',
            subs: []
          });
        } else {
          result.push({
            name: 'xxx',
            operator: value.block[0].field[0]._ === 'OR' ? 'OR' : 'AND',
            type: 'GROUP',
            subs: value.block[0].value ? this.generateSubs(value.block[0].value) : []
          });
        }
      });
    }
    return result;
  }

}
