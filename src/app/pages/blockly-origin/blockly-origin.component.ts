import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { BlocklyConfig } from 'projects/my-lib/src/public-api';
declare let Blockly: any;
@Component({
  selector: 'app-blockly-origin',
  templateUrl: './blockly-origin.component.html',
  styleUrls: ['./blockly-origin.component.scss']
})
export class BlocklyOriginComponent implements OnInit, AfterViewInit {
  blockConfig: BlocklyConfig = {
    toolbox: `<xml id="toolbox" style="display: none">
      <block type="controls_if"></block>
      <block type="controls_repeat_ext"></block>
      <block type="logic_compare"></block>
      <block type="math_number"></block>
      <block type="math_arithmetic"></block>
      <block type="text"></block>
      <block type="text_print"></block>
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
  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    const workspace = Blockly.inject('blocklyDiv', this.blockConfig);
    window.addEventListener('resize', onresize, false);
    fromEvent(window, 'resize').subscribe(() => {
      this.onResize(workspace);
    });
    this.onResize(workspace);
    Blockly.svgResize(workspace);
  }

  onResize(workspace: any) {
    let element: any = this.blocklyArea.nativeElement;
    let x = 0;
    let y = 0;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);
    // Position blocklyDiv over blocklyArea.
    this.blocklyDiv.nativeElement.style.left = x + 'px';
    this.blocklyDiv.nativeElement.style.top = y + 'px';
    this.blocklyDiv.nativeElement.style.width = this.blocklyArea.nativeElement.offsetWidth + 'px';
    this.blocklyDiv.nativeElement.style.height = this.blocklyArea.nativeElement.offsetHeight + 'px';
    Blockly.svgResize(workspace);
  }

}
