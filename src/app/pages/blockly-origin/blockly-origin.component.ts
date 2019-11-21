import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { BlocklyConfig, CustomeBlocks, Toolboxs, CxxTheme } from 'projects/my-lib/src/public-api';
declare let Blockly: any;
@Component({
  selector: 'app-blockly-origin',
  templateUrl: './blockly-origin.component.html',
  styleUrls: ['./blockly-origin.component.scss']
})
export class BlocklyOriginComponent implements OnInit,  OnDestroy, AfterViewInit {
  workspace: any; // blockly workspace
  customizedTheme = new Blockly.Theme(CxxTheme.blockStyles, CxxTheme.categoryStyles);
  blockConfig: BlocklyConfig = {
    toolbox: Toolboxs.defaultToolbox,
    scrollbars: true, // 工作区域可滚动
    trashcan: true, // 显示或隐藏垃圾桶
    sounds: true, // 拖动block拼接时的音效
    media: '/assets/blockly/media/', // blockly媒体路径---默认路径访问不到，需要翻墙
    theme: this.customizedTheme,
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
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }

  ngAfterViewInit() {
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
        const blockText = '<block type=colour_picker>' +
            '<field name=COLOUR>' + item + '</field>' +
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
    const xml = `<xml xmlns=https://developers.google.com/blockly/xml>
    <block type=turtle_basic id=LDFnCO-k#osS|^tM{]6E x=14 y=-20>
      <field name=TURTLE pattern=Dots hat=Stovepipe>Yertle</field>
      <comment pinned=false h=80 w=160>Demonstrates a turtle field with no validator.</comment>
    </block>
    <block type=turtle_nullifier  x=10 y=120>
      <field name=TURTLE pattern=Dots hat=Stovepipe>Yertle</field>
      <comment pinned=false h=80 w=160>Validates combinations of names and hats to null (invalid) if they could be considered infringe-y. This turns the turtle field red. Infringe-y combinations are: (Leonardo, Mask), (Yertle, Crown), and (Franklin, Propeller).</comment>
    </block>
    <block type=turtle_changer id=6KD1p3b|kZVG[(,~SWU* x=10 y=230>
      <field name=TURTLE pattern=Dots hat=Crown>Yertle</field>
      <comment pinned=false h=80 w=160>Validates the input so that certain names always have specific hats. The name-hat combinations are: (Leonardo, Mask), (Yertle, Crown), (Franklin, Propeller).</comment>
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
