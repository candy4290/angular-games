import { Injectable, Renderer2, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomBlock, NgxBlocklyConfig, NgxBlocklyComponent } from 'ngx-blockly';
import { map, tap } from 'rxjs/operators';
import { VariableGetBlock, ValuesDropDownBlock } from 'my-lib';
import { of, Observable, zip } from 'rxjs';
import { generateColor } from 'my-lib';
import { NzModalService } from 'ng-zorro-antd';
import { RenameVariableComponent } from './rename-variable/rename-variable.component';
import * as xml2js from 'xml2js';

declare var Blockly: any;
@Injectable()

export class BlocklyService {
  searchResult: HTMLElement; // 搜索结果dom元素
  loadedVariables = new Set(); // 存储已加载的变量block的type --- 暂时用来做搜索用，后面可以删除
  workspace: NgxBlocklyComponent;
  categoriesInString = ''; // 远程加载的目录结构string表示
  constructor(private http: HttpClient,
              private modalService: NzModalService) {
  }

  clear() {
    this.searchResult = null;
    this.categoriesInString = '';
    this.loadedVariables.clear();
    // 卸载已经注册的extensions和fieldRegistry,或者使用try catch
    Blockly.Extensions.unregister('blockly_self_add_mutator');
    Blockly.fieldRegistry.unregister('self-selector');
    Blockly.tree.BaseNode.prototype.categoriesInObject = null;
    Blockly.utils.IdGenerator.nextId_ = 0;
    this.workspace.workspace.dispose();
  }

  /**
   * 根据目录code,name生成相应的变量、值、变量&值逻辑表达式
   *
   * @param {string} code 所属目录的code
   * @param {string} name 所属目录的名称
   * @param {string} categoryColour 所属目录的颜色
   * @returns {Observable<string[]>} 返回一个string数组,包含三个数值，分别为变量、值、变量&值逻辑表达式的xml
   * @memberof BlocklyService
   */
  getDropDown(code: string, name: string, categoryColour: string): Observable<string[]> {
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
        let xmlsCombinedBlocks = '';
        if (labels.length > 0) {
          // 创建变量
          const tempVariableKey = this.createVariableGetBlock(name, code, categoryColour);
          xmlsKey += tempVariableKey.toXML();
          tempBlocksKey.push(
            tempVariableKey
          );
          // 创建值
          const tempVariable = this.createValuesDropDownBlock(code, name, categoryColour, labels);
          xmlsValue += tempVariable.toXML();
          tempBlocksValue.push(
            tempVariable
          );
          // 创建键值对逻辑处理块
          xmlsCombinedBlocks = this.generateKeyValueExpression(xmlsKey, xmlsValue);
        }
        return [xmlsKey, xmlsValue, xmlsCombinedBlocks];
      })
    );
  }

  /**
   * 根据键、值的xml，生成键值对表达式的xml
   *
   * @param {string} key
   * @param {string} value
   * @memberof BlocklyService
   */
  generateKeyValueExpression(key: string, value: string): string {
    return `
      <block type="logic_compare">
        <field name="OP">EQ</field>
        <value name="A">
          ${key}
        </value>
        <value name="B">
          ${value}
        </value>
      </block>
    `;
  }

  /**
   * 更改Blockly默认样式
   */
  changeBlocklyDefaultStyle() {
    // 异步加载目录下的block,使用refreshSelection动态更新flyout中的block. TODO：如果目录中的标签已经都加载过，则无需异步请求，直接生成相应xml就可以
    Blockly.Toolbox.prototype.loadVariable = (node) => {
      const categoryColour = node.hexColour;
      const categoryName = node.content_;
      const categoryCode = node.code;
      if (categoryCode && node.blocks.length === 0 && categoryName !== '查询结果') {
        // 异步加载blocks
        this.getDropDown(categoryCode, categoryName, categoryColour).subscribe(rsp => {
          const treeControl = this.workspace.workspace.getToolbox().tree_; // 每次调用renderTree都会生成新的TreeControl
          const preSelectedItem = treeControl.getSelectedItem();
          if (rsp[0]) {
            const xml = Blockly.Xml.textToDom(`<xml>
            <label text="${categoryName}-变量"></label>
            ${rsp[0]}
            <label text="${categoryName}-值"></label>
            ${rsp[1]}
            <label text="${categoryName}-表达式"></label>
            ${rsp[2]}
            </xml>`);
            preSelectedItem.blocks.push(...xml.children);
            this.workspace.workspace.getToolbox().refreshSelection();
          }
        });
      }
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
    const that = this;
    this.loadedVariables.forEach((item: string) => {
      const temp =  item.split('__');
      const value = temp[3];
      const dropdownType = that.getDropDownBlockType(temp[1], value, temp[2]);
      if (value.indexOf(keyWords) > -1) {
        result += `
        <label text="${value}-变量"></label>
        <block type='${item}'></block>
        <label text="${value}-值"></label>
        <block type="${dropdownType}"></block>
        <label text="${value}-表达式"></label>
        ${this.generateKeyValueExpression(`<block type='${item}'></block>`, `<block type="${dropdownType}"></block>`)}
        `;
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
      if (categoryes[i].name) {
        (Blockly.tree.BaseNode.prototype.categoriesInObject || {})[categoryes[i].name] = {
          commonUrl: categoryes[i].commonUrl,
          activeUrl: categoryes[i].activeUrl
        };
      }
      this.categoriesInString += `<category code="${categoryes[i].code}" name="${categoryes[i].name}" colour="${categoryes[i].color || generateColor()}">`;
      const children = categoryes[i].tagClassChildren || [];
      if (children.length > 0) {
        this.jsonToXml(children);
      }
      this.categoriesInString += '</category>';
    }
  }

  /**
   * 创建变量
   *
   * @param {string} name 变量名
   * @param {string} code 所属目录的code---对应变量的type
   * @param {string} categoryColour 所属目录的颜色
   * @returns
   * @memberof BlocklyService
   */
  createVariableGetBlock(name: string, code: string, categoryColour: string) {
    const variableBlockType = `variables_get__${code}__${categoryColour}__${name}`;
    this.loadedVariables.add(variableBlockType);
    const tempVariableKey = new VariableGetBlock(variableBlockType, null, null, name, code, categoryColour);
    if (!Blockly.Blocks[variableBlockType]) {
      this.initVariableBlock(tempVariableKey);
    }
    return tempVariableKey;
  }

  /**
   * 创建下拉block
   *
   * @param {string} code 目录code
   * @param {string} name 目录name
   * @param {string} categoryColour 目录颜色
   * @param {string} fieldValue filed的当前值
   * @memberof BlocklyService
   */
  createValuesDropDownBlock(code: string, name: string, categoryColour: string, labels: string[], fieldValue?: string) {
    const dropdownBlockType = this.getDropDownBlockType(code, name, categoryColour);
    const extensionName = `extension_${code}`;
    const tempVariable =  new ValuesDropDownBlock(dropdownBlockType, null, null, extensionName, code, categoryColour);
    if (!Blockly.Blocks[dropdownBlockType]) {
      try {
        Blockly.Extensions.register(extensionName,
          function() {
            this.getInput('INPUT')
              .appendField(new Blockly.SelfSelectorField(labels, fieldValue, this), 'NAME');
          });
      } catch {}
      this.initVariableBlock(tempVariable);
    }
    return tempVariable;
  }

  /**
   * 获取下拉block的jsonType
   *
   * @param {string} code 所属目录code
   * @param {string} name 所属目录name
   * @param {string} categoryColour 所属目录颜色
   * @memberof BlocklyService
   */
  getDropDownBlockType(code: string, name: string, categoryColour: string) {
    return `dropdown__${code}__${name}__${categoryColour}`;
  }

  /**
   *  解析xml并加载其中的block
   */
  parseXmlAndInitBlock(result: string): Observable<any> {
    const rxs: Observable<any>[] = [];
    const labels = [];
    let labelStart = 0;
    let labelEnd = 0;
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
      const fieldStart = label.indexOf('<field');
      const filedValueStart = label.indexOf('>', fieldStart + 6);
      const filedValueEnd = label.indexOf('<', filedValueStart + 1);
      const temps = label.slice(blockTypeStart, blockTypeEnd).split('__');
      if (dropdownValues.findIndex(item => item.code === temps[1]) === -1) {
        dropdownValues.push({
          code: temps[1],
          name: temps[2],
          categoryColour: temps[3],
          fieldValue: label.slice(filedValueStart + 1, filedValueEnd)
        });
      }
    });
    dropdownValues.forEach(item => {
      const dropdownBlockType = this.getDropDownBlockType(item.code, item.name, item.categoryColour);
      if (!Blockly.Blocks[dropdownBlockType]) {
        this.createVariableGetBlock(item.name, item.code, item.categoryColour);
        // 获取标签
        const temp$ = this.http.put('http://10.19.248.200:31082/api/v1/tag/children', {
          code: item.code,
          name: item.name
        }).pipe(tap((rsp: any) => {
            // tslint:disable-next-line: no-shadowed-variable
          const labels = (rsp.results  || []).map((item: any) => [item.name, item.name]);
          this.createValuesDropDownBlock(item.code, item.name, item.categoryColour, labels, item.fieldValue);
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
  parseToBackend(xml: string, ruleTermName?: string, description?: string) {
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
            name: (value.block[0].value || [])[0] ? value.block[0].value[0].block[0].field[0]._ : '',
            value: (value.block[0].value || [])[1] ? value.block[0].value[1].block[0].field[0]._ : '',
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
