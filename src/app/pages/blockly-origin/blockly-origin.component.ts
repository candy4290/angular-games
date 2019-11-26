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
    // extension注册到blockly----->鼠标悬浮的提示
    // Blockly.Extensions.register('parent_tooltip_extension',
    //   function() {
    //  // The methods on the mixin object will be added to each block instance, so this may be used to refer to the block.
    //     const thisBlock = this;
    //     this.setTooltip(() => {
    //       const parent = thisBlock.getParent();
    //       return (parent && parent.getInputsInline() && parent.tooltip) ||
    //         Blockly.Msg.MATH_NUMBER_TOOLTIP;
    //   });
    // });
    this.loadCustomeBlock([CustomeBlocks.jsonBlock,
      CustomeBlocks.booleanB,
      CustomeBlocks.andOr,
      CustomeBlocks.blockSelfMutator
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
    Blockly.Extensions.registerMutator('blockly_self_add_mutator', {
      /**
       * 生成xml时调用此方法
       */
      mutationToDom() {
        console.log('++++');
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
        console.log('----');
        console.log(this);
        let itemBlock = containerBlock.getInputTargetBlock('NAME');
        let i = 1;
        while (itemBlock) {
          const input = this.getInput('NAME' + i);
          itemBlock.valueConnection_ = input && input.connection.targetConnection;
          i++;
          itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
        }
      }
    });
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
