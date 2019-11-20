import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { BlocklyConfig, CustomeBlocks } from 'projects/my-lib/src/public-api';
declare let Blockly: any;
@Component({
  selector: 'app-blockly-origin',
  templateUrl: './blockly-origin.component.html',
  styleUrls: ['./blockly-origin.component.scss']
})
export class BlocklyOriginComponent implements OnInit,  OnDestroy, AfterViewInit {
  workspace: any; // blockly workspace
  blockConfig: BlocklyConfig = {
    toolbox: `<xml id="toolbox" style="display: none">
    <category name="Logic" categorystyle="logic_category"></category>
    <category name="Loops" colour="120"></category>
    <category name="Math" colour="230"></category>
    <category name="Colour" colour="20"></category>
    <category name="Variables" colour="330" custom="VARIABLE"></category>
    <category name="Functions" colour="290" custom="PROCEDURE"></category>
    <category name="Colours" colour="80" custom="COLOUR_PALETTE"></category>
    <category name="Core" expanded="true">
      <category name="Control">
        <block type="controls_if"></block>
        <block type="controls_whileUntil"></block>
      </category>
      <category name="Logic">
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_boolean"></block>
      </category>
    </category>
    <category name="Blocks" colour="0">
      <block type="logic_boolean"></block>

      <block type="math_number">
        <field name="NUM">42</field>
      </block>

      <block type="controls_for">
        <value name="FROM">
          <block type="math_number">
            <field name="NUM">1</field>
          </block>
        </value>
        <value name="TO">
          <block type="math_number">
            <field name="NUM">10</field>
          </block>
        </value>
        <value name="BY">
          <block type="math_number">
            <field name="NUM">1</field>
          </block>
        </value>
      </block>

      <block type="math_arithmetic">
        <field name="OP">ADD</field>
        <value name="A">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="B">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>

      <block type="math_arithmetic">
        <field name="VAR" id=".n*OKd.u}2UD9QFicbEX" variabletype="Panda">Bai Yun</field>
      </block>
      <block type="length of"  id=".I+Y4^!yXG]zE70!ywTT" x="10" y="10" deletable="false" movable="false">
        <field name="VALUE">FALSE</field>
      </block>
      <button text="create Panda" callbackKey="createPanda"></button>
    </category>
  </xml>`,
    scrollbars: true, // 工作区域可滚动
    trashcan: true, // 显示或隐藏垃圾桶
    sounds: true, // 拖动block拼接时的音效
    media: '/assets/blockly/media/', // blockly媒体路径---默认路径访问不到，需要翻墙
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2
    }, // 缩放定义
    grid: {
      spacing: 20, // 网格点间距
      length: 3,
      colour: '#ccc',
      snap: true // 捕捉，将块放到最近的网格点
    }, // 工作区网格背景
  }
  @ViewChild('blocklyDiv', {static: true}) blocklyDiv: ElementRef;
  @ViewChild('blocklyArea', {static: true}) blocklyArea: ElementRef;
  private subscription$ = new Subscription();
  constructor() {
    this.loadCustomeBlock([CustomeBlocks.jsonBlock,
      // CustomeBlocks.vGet,
      // CustomeBlocks.vSet,
      // CustomeBlocks.pG, CustomeBlocks.pS
    ]);

    // 返回js代码
    Blockly.JavaScript['length of'] = (block: any) => {
      return '打死你';
    };
  }

  ngOnInit() {
    this.workspace = Blockly.inject('blocklyDiv', this.blockConfig);
    this.workspace.registerButtonCallback('createPanda', (e) => {
      Blockly.Variables.createVariable(e.getTargetWorkspace(), null, 'panda');
    });
    this.workspace.registerToolboxCategoryCallback('COLOUR_PALETTE', () => this.coloursFlyoutCallback());
    window.addEventListener('resize', onresize, false);
    const onResize$ = fromEvent(window, 'resize').subscribe(() => {
      this.onResize(this.workspace);
    });
    this.subscription$.add(onResize$);
    this.onResize();
    Blockly.svgResize(this.workspace);
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }

  ngAfterViewInit() {
  }

  /**
   *  Position blocklyDiv over blocklyArea.
   */
  onResize(workspace: any = this.workspace) {
    let element: any = this.blocklyArea.nativeElement;
    let x = 0;
    let y = 0;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);
    this.blocklyDiv.nativeElement.style.left = x + 'px';
    this.blocklyDiv.nativeElement.style.top = y + 'px';
    this.blocklyDiv.nativeElement.style.width = this.blocklyArea.nativeElement.offsetWidth + 'px';
    this.blocklyDiv.nativeElement.style.height = this.blocklyArea.nativeElement.offsetHeight + 'px';
    Blockly.svgResize(workspace);
  }

  coloursFlyoutCallback() {
    const colourList =  ['#4286f4', '#ef0447'];
    const xmlList = [];
    if (Blockly.Blocks['colour_picker']) {
      for (const item of colourList) {
        const blockText = '<block type="colour_picker">' +
            '<field name="COLOUR">' + item + '</field>' +
            '</block>';
        const block = Blockly.Xml.textToDom(blockText);
        xmlList.push(block);
      }
    }
    return xmlList;
  }

  /**
   * 加载定制化的block
   */
  loadCustomeBlock(jsonBlocsk: any[]) {
    jsonBlocsk.forEach(item => {
      Blockly.Blocks[item.type ] = {
        init() {
          this.jsonInit(item);
        }
      };
    });
  }

  /**
   * 查看js代码
   *
   */
  showCode() {
    // Generate JavaScript code and display it.
    Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
    const code = Blockly.JavaScript.workspaceToCode(this.workspace);
    console.log(code);
  }

  /**
   * 从xml复原
   */
  recorver() {
    const xml = `<xml xmlns="https://developers.google.com/blockly/xml"><block type="length of"  deletable="false" movable="false" x="10" y="330"> <field name="VALUE">FALSE</field>
    <field name="FIELDNAME">90</field>
    <field name="xxx">#ff0000</field>
  </block>
</xml>`;
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), this.workspace);
  }

  /**
   * 转为xml
   */
  saveXml() {
    const xml = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(this.workspace));
    console.log(xml);
  }

}
