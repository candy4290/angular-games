import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { BlocklyConfig, CustomeBlocks, Toolboxs, CxxTheme } from 'my-lib';
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
    Blockly.Extensions.registerMutator('blockly_self_add_mutator', {
      /**
       * 生成xml时调用此方法
       */
      mutationToDom() {
        console.log('++++');
        console.log(this);
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
        console.log('decompose');
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
    }, null, ['block_self_boolean']);
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
      CustomeBlocks.andOr,
      CustomeBlocks.booleanB,
      CustomeBlocks.blockSelfMutator,
      CustomeBlocks.vGet,
      CustomeBlocks.vSet,
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
      Blockly.Variables.createVariableButtonHandler(e.getTargetWorkspace(), () => {
        this.workspace.updateToolbox(Toolboxs.defaultToolbox2);
      }, 'panda');
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
      for (let i = 0; i < colourList.length; i++) {
        const blockText = '<block type="colour_picker">' +
            '<field name="COLOUR">' + colourList[i] + '</field>' +
            '</block>' ;
        const block = Blockly.Xml.textToDom(blockText);
        xmlList.push(block);
      }
      const btn = Blockly.Xml.textToDom('<button text="createPanda" callbackKey="createPanda"></button>');
      xmlList.push(btn);
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
    const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
    <variables>
      <variable id="Hiw1Cr%=AIhTY}M38=0q">age</variable>
      <variable id="iPE.ROtaLSrUqtiZxHWf">sex</variable>
      <variable id="*(1^B%|%D!(L24fT2aLO">criminalRecord</variable>
    </variables>
    <block type="controls_if" id=";pRgRdNpTaiAC/w,|0Vz" x="190" y="-50">
      <value name="IF0">
        <block type="logic_block_self_add">
          <mutation xmlns="http://www.w3.org/1999/xhtml" items="2"></mutation>
          <field name="NAME">||</field>
          <value name="NAME1">
            <block type="logic_block_self_add">
              <mutation xmlns="http://www.w3.org/1999/xhtml" items="3"></mutation>
              <field name="NAME">&amp;&amp;</field>
              <value name="NAME1">
                <block type="logic_compare" id="mp;B?}pV%({t,xjnGnP4">
                  <field name="OP">GT</field>
                  <value name="A">
                    <block type="variables_get" id="%lE[TLEQ.hE)xx@}:w?H">
                      <field name="VAR" id="Hiw1Cr%=AIhTY}M38=0q">age</field>
                    </block>
                  </value>
                  <value name="B">
                    <block type="math_number" id="):zn_?6){6CU(*nMQn-q">
                      <field name="NUM">18</field>
                    </block>
                  </value>
                </block>
              </value>
              <value name="NAME2">
                <block type="logic_compare" id="aM$XM4!RvrT/*{+Nj@f:">
                  <field name="OP">EQ</field>
                  <value name="A">
                    <block type="variables_get" id="oq~U+7+ojTIAuf(~Qr#n">
                      <field name="VAR" id="iPE.ROtaLSrUqtiZxHWf">sex</field>
                    </block>
                  </value>
                  <value name="B">
                    <block type="text" id="-onafA@i:DoqsL56?o[U">
                      <field name="TEXT">男</field>
                    </block>
                  </value>
                </block>
              </value>
              <value name="NAME3">
                <block type="logic_compare" id="z#}#4uaSQA)!Svb60#Cw">
                  <field name="OP">GT</field>
                  <value name="A">
                    <block type="variables_get" id="v{J+tIIsP/:)76VDDWWS">
                      <field name="VAR" id="*(1^B%|%D!(L24fT2aLO">criminalRecord</field>
                    </block>
                  </value>
                  <value name="B">
                    <block type="math_number">
                      <field name="NUM">5</field>
                    </block>
                  </value>
                </block>
              </value>
            </block>
          </value>
          <value name="NAME2">
            <block type="logic_block_self_add" id="6XwmFD-AIvevS/WOrkPg">
              <mutation xmlns="http://www.w3.org/1999/xhtml" items="3"></mutation>
              <field name="NAME">&amp;&amp;</field>
              <value name="NAME1">
                <block type="logic_compare" id="WX[Qn]WRxYmGvDO:KG)q">
                  <field name="OP">GT</field>
                  <value name="A">
                    <block type="variables_get">
                      <field name="VAR" id="Hiw1Cr%=AIhTY}M38=0q">age</field>
                    </block>
                  </value>
                  <value name="B">
                    <block type="math_number" id="m-7h+N]%,rE!UOEQMU2s">
                      <field name="NUM">28</field>
                    </block>
                  </value>
                </block>
              </value>
              <value name="NAME2">
                <block type="logic_compare" id="Sw$t=RB{=,~#HJ=ao-pw">
                  <field name="OP">EQ</field>
                  <value name="A">
                    <block type="variables_get" id="O$Xr*.S)s90_[=r}%NM=">
                      <field name="VAR" id="iPE.ROtaLSrUqtiZxHWf">sex</field>
                    </block>
                  </value>
                  <value name="B">
                    <block type="text" id="K$nVGB3Z1Hjrn=?UA52*">
                      <field name="TEXT">女</field>
                    </block>
                  </value>
                </block>
              </value>
              <value name="NAME3">
                <block type="logic_compare" id="0~JbnKOQnrx|gG_v{LE6">
                  <field name="OP">GT</field>
                  <value name="A">
                    <block type="variables_get" id="=cu0]A;Vw/LKT3g)-lYB">
                      <field name="VAR" id="*(1^B%|%D!(L24fT2aLO">criminalRecord</field>
                    </block>
                  </value>
                  <value name="B">
                    <block type="math_number" id="CZg}8iI(z?h@)AX8zk+J">
                      <field name="NUM">2</field>
                    </block>
                  </value>
                </block>
              </value>
            </block>
          </value>
        </block>
      </value>
      <statement name="DO0">
        <block type="text_print" id="J/KdKs#j)@^6(S^vPtKb">
          <value name="TEXT">
            <block type="text" id="DIG,Bzc9}iZ*hI{pGFi9">
              <field name="TEXT">可疑人员</field>
            </block>
          </value>
        </block>
      </statement>
    </block>
  </xml>
  `;
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
