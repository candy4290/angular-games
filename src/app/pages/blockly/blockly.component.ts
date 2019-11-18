import { OnInit, OnDestroy, Component, ViewChild } from '@angular/core';
import { NgxBlocklyConfig, NgxBlocklyGeneratorConfig, NgxBlocklyComponent } from 'ngx-blockly';
@Component({
  selector: 'app-blockly',
  templateUrl: './blockly.component.html',
  styleUrls: ['./blockly.component.scss']
})
export class BlocklyComponent implements OnInit, OnDestroy {
  @ViewChild(NgxBlocklyComponent, {static: true}) workspace: any;
  public config: NgxBlocklyConfig = {
    toolbox: '<xml id="toolbox" style="display: none">' +
                '<block type="controls_if"></block>' +
                '<block type="controls_repeat_ext"></block>' +
                '<block type="logic_compare"></block>' +
                '<block type="math_number"></block>' +
                '<block type="math_arithmetic"></block>' +
                '<block type="text"></block>' +
                '<block type="text_print"></block>' +
             '</xml>',
    scrollbars: true, // 工作区域可滚动
    trashcan: true, // 显示或隐藏垃圾桶
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

  constructor() {

  }

  ngOnInit() {
  }

  ngOnDestroy() {

  }

  onCode(code: string) {
    console.log(code);
    this.workspace.toXml();
}
}
