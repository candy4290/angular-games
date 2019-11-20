import { OnInit, OnDestroy, Component, ViewChild, Inject } from '@angular/core';
import { NgxBlocklyConfig, NgxBlocklyGeneratorConfig,
  NgxBlocklyComponent, CustomBlock, NgxToolboxBuilderService,
  Category, LOGIC_CATEGORY, LOOP_CATEGORY, MATH_CATEGORY,
  TEXT_CATEGORY, Separator, LISTS_CATEGORY, COLOUR_CATEGORY,
  VARIABLES_CATEGORY, FUNCTIONS_CATEGORY } from 'ngx-blockly';
import { BlocklyService } from './blockly.service';
import { Subscription } from 'rxjs';
import { TestBlock, PandaSetBlock, PandaGetBlock } from 'projects/my-lib/src/public-api';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-blockly',
  templateUrl: './blockly.component.html',
  styleUrls: ['./blockly.component.scss']
})
export class BlocklyComponent implements OnInit, OnDestroy {
  public customBlocks: CustomBlock[] = [
    new TestBlock('length of', null, null),
    // new PandaSetBlock('panda set', null, null),
    // new PandaGetBlock('panda get', null, null),
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
              @Inject(DOCUMENT) private doc: Document) {
    this.ngxToolboxBuilder.nodes = [
      new Category(this.customBlocks, '#FF00FF', 'TestToolbox', null),
      LOGIC_CATEGORY,
      LOOP_CATEGORY,
      MATH_CATEGORY,
      TEXT_CATEGORY,
      new Separator(), // Add Separator
      LISTS_CATEGORY,
      COLOUR_CATEGORY,
      VARIABLES_CATEGORY,
      FUNCTIONS_CATEGORY
    ];
    this.config.toolbox = this.ngxToolboxBuilder.build();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }

  onCode(code: string) {
    console.log(code);
  }

  save() {
    console.log(this.workspace);
    const xml = this.workspace.toXml();
    console.log(xml);
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

  restore() {
    const getXml$ = this.blockly.getXml().subscribe(r => {
      console.log(r);
      this.workspace.fromXml(r);
    });
    this.subscription$.add(getXml$);
  }
}
