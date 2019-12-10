import { OnInit, OnDestroy, Component, ViewChild, Inject, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { NgxBlocklyConfig, NgxBlocklyGeneratorConfig,
  NgxBlocklyComponent, CustomBlock, NgxToolboxBuilderService, Category, Separator } from 'ngx-blockly';
import { BlocklyService } from './blockly.service';
import { LOGIC_CATEGORY, LOOP_CATEGORY, MATH_CATEGORY, TEXT_CATEGORY, LISTS_CATEGORY } from './category';
import { Subscription, Subject } from 'rxjs';
import { AndOrBlock, CreateVariableButton, VariableGetBlock, ValuesDropDownBlock, SelfSelectorField } from 'my-lib';
import { DOCUMENT } from '@angular/common';
import { NzMessageService, NzModalService, NzModalRef } from 'ng-zorro-antd';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CreateVariableComponent } from './create-variable/create-variable.component';
// import * as parser from 'xml2json';
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
    new ValuesDropDownBlock('values_drop_down', null, null)
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
    javascript: true,
  };
  keyWords: string;
  private subscription$ = new Subscription();
  private nzModalRef$: NzModalRef;
  private searchItems$ = new Subject<string>();
  @ViewChild('searchInput', {static: true}) searchInput: any;
  constructor(private blockly: BlocklyService,
              private ngxToolboxBuilder: NgxToolboxBuilderService,
              private messageService: NzMessageService,
              @Inject(DOCUMENT) private doc: Document,
              private el: ElementRef,
              private render2: Renderer2,
              private modalService: NzModalService) {
    this.blockly.changeToolboxStyle();
    this.blockly.loadBlockInMutator();
    this.ngxToolboxBuilder.nodes = [
      LOGIC_CATEGORY,
      LOOP_CATEGORY,
      MATH_CATEGORY,
      TEXT_CATEGORY,
      LISTS_CATEGORY,
    ];
    this.config.toolbox = this.ngxToolboxBuilder.build();
    const selfSelectorField = new SelfSelectorField();
  }

  ngOnInit() {
    const search$ = this.searchItems$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((rsp: string) => {
        return this.blockly.searchBlockByName(rsp, this.workspace);
      })
    ).subscribe();
    this.subscription$.add(search$);
  }

  ngAfterViewInit() {
    this.blockly.workspace = this.workspace;
    this.blockly.insertSearchInputIntoToolbox(this.render2, this.el, this.workspace);
    this.workspace.workspace.registerButtonCallback('createAge', () => {this.createVariableDialog(); });
    this.workspace.workspace.registerButtonCallback('loadVariables', () => {this.loadVariables(); });
    this.blockly.loadCategories(this.config, this.workspace).subscribe(rsp => {
    });
  }

  loadVariables() {
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
    this.nzModalRef$.close();
    this.blockly.clear();
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
    const blocksInWorkspace = this.workspace.workspace.getAllBlocks();
    if (blocksInWorkspace && blocksInWorkspace.length > 0) {
      const xml = this.workspace.toXml();
      // console.log(parser.toJson(xml));
      this.exportToXml(xml);
    } else {
      this.messageService.warning('工作区空空如也~');
    }
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
        const result = `${fileReader.result}`;
        this.blockly.parseXmlAndInitBlock(result);
        this.messageService.success('文件导入成功！');
        this.workspace.fromXml(result);
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

  /**
   * 清空工作区间
   */
  clear() {
    this.workspace.workspace.clear();
  }

  /**
   * 撤销
   */
  undo() {
    this.workspace.workspace.undo();
  }

  keyup(event: any) {
    this.searchItems$.next(this.keyWords);
    if (event.keyCode === 13) {
      // 回车
    }
  }

  /**
   * 选中搜索的目录
   */
  focus() {

  }

  /**
   *  弹出创建变量弹窗
   */
  createVariableDialog() {
    this.nzModalRef$ = this.modalService.create({
      nzTitle: '创建变量',
      nzContent: CreateVariableComponent,
      nzComponentParams: {
        ngxToolboxBuilder: this.ngxToolboxBuilder,
        workspace: this.workspace
      },
      nzMaskClosable: false
    });
  }
}
