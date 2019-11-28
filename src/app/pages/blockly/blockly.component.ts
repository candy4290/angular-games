import { OnInit, OnDestroy, Component, ViewChild, Inject, AfterViewInit } from '@angular/core';
import { NgxBlocklyConfig, NgxBlocklyGeneratorConfig,
  NgxBlocklyComponent, CustomBlock, NgxToolboxBuilderService, Category, Separator } from 'ngx-blockly';
import { BlocklyService, LOGIC_CATEGORY, LOOP_CATEGORY, MATH_CATEGORY, TEXT_CATEGORY, LISTS_CATEGORY, VARIABLES_CATEGORY } from './blockly.service';
import { Subscription } from 'rxjs';
import { AndOrBlock, ClickDrivenBlock } from 'projects/my-lib/src/public-api';
import { DOCUMENT } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd';
declare var Blockly: any;
@Component({
  selector: 'app-blockly',
  templateUrl: './blockly.component.html',
  styleUrls: ['./blockly.component.scss']
})
export class BlocklyComponent implements OnInit, AfterViewInit, OnDestroy {
  content: string;
  jsCode: string;
  xml: string;
  selectedLanguage = 'zh-hans'; // 当前选择的语言
  public customBlocks: CustomBlock[] = [
    new AndOrBlock('logic_block_self_add', null, null),
    new ClickDrivenBlock('block_click_driven', null, null)
  ]; // 自定义blocks
  @ViewChild(NgxBlocklyComponent, {static: true}) workspace: NgxBlocklyComponent;
  public config: NgxBlocklyConfig = {
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
  };

  public generatorConfig: NgxBlocklyGeneratorConfig = {
    // dart: true,
    javascript: true,
    // lua: true,
    // php: true,
    // python: true,
    // xml: true
  };
  private subscription$ = new Subscription();
  constructor(private blockly: BlocklyService,
              private ngxToolboxBuilder: NgxToolboxBuilderService,
              private messageService: NzMessageService,
              @Inject(DOCUMENT) private doc: Document) {
    this.blockly.changeToolboxStyle();
    this.blockly.loadBlockInMutator();
    this.ngxToolboxBuilder.nodes = [
      new Category(this.customBlocks, '#FF00FF', '自定义', null), new Separator(),
      LOGIC_CATEGORY, new Separator(),
      LOOP_CATEGORY,  new Separator(),
      MATH_CATEGORY, new Separator(),
      TEXT_CATEGORY, new Separator(),
      LISTS_CATEGORY, new Separator(),
      VARIABLES_CATEGORY
    ];
    this.config.toolbox = this.ngxToolboxBuilder.build();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.workspace.workspace.registerButtonCallback('createAge', (e: any) => {
      Blockly.Variables.createVariable(e.getTargetWorkspace(), null, 'Number'); // 创建一个类型为Number的变量
    });
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }


  /**
   * 实时显示当前工作区的代码
   *
   */
  onCode(code: string) {
    this.jsCode = code;
    this.xml = this.workspace.toXml()
  }

  /**
   * 将当前工作区保存到xml
   *
   */
  save() {
    const xml = this.workspace.toXml();
    this.exportToXml(xml);
  }

  exportToXml(content: string) {
    const exportBlob = new Blob([content], {type: 'text/xml'});
    const a = this.doc.createElement('a');
    a.href = window.URL.createObjectURL(exportBlob);
    a.download = 'library1.xml';
    a.click();
    a.remove();

    window.URL.revokeObjectURL(a.href);
  }

  /**
   * 切换语言
   *
   */
  changeLanguage(lang: string) {
    console.log(lang);
  }

  /**
   * 导入文件，获取文件流，读取xml文件内容，并加载到workspace中去
   *
   */
  beforeUpload = (file: File) => {
    const fileReader = new FileReader();
    if (typeof FileReader === 'undefined') {
      this.messageService.error('您的浏览器不支持FileReader!');
    } else {
      fileReader.readAsText(file);
      fileReader.onload = () => {
        this.messageService.success('文件导入成功！');
        this.workspace.fromXml(`${fileReader.result}`);
      };
    }
    return false;
  }

  /**
   * 执行
   */
  executeProgram() {
    // tslint:disable-next-line: no-eval
    eval(this.jsCode);
  }

  clear() {
    this.workspace.workspace.clear();
  }
}
