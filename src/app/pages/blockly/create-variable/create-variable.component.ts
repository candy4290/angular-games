import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { NzModalRef, NzModalService, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { BlocklyService } from '../blockly.service';
import { NgxToolboxBuilderService, NgxBlocklyComponent, Category } from 'ngx-blockly';
import { CreateVariableButton, VariableGetBlock } from 'projects/my-lib/src/public-api';
declare var Blockly: any;
@Component({
  selector: 'app-create-variable',
  templateUrl: './create-variable.component.html',
  styleUrls: ['./create-variable.component.scss']
})
export class CreateVariableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() ngxToolboxBuilder: NgxToolboxBuilderService;
  @Input() workspace: NgxBlocklyComponent;
  createVariableForm: FormGroup;
  isConfirmLoading: boolean; // 提交按钮loading状态
  @ViewChild('tplFooter', {static: true}) tplFooter: any;
  constructor(private nzModalRef: NzModalRef,
              private modalService: NzModalService,
              private fb: FormBuilder,
              private blockly: BlocklyService,
              private nzMessageService: NzMessageService) {
                this.createVariableForm = this.fb.group({
                  variableName: new FormControl(null, [Validators.required]),
                  variableType: new FormControl(null, [Validators.required]),
                  variableDescription: new FormControl('', []),
                });
              }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.nzModalRef.getInstance().nzFooter = this.tplFooter;
  }

  ngOnDestroy() {

  }

  handleCancel() {
    this.nzModalRef.close();
  }

  handleOk() {
    this.updateFlyout();
    this.nzMessageService.success(`变量：${this.createVariableForm.value.variableName}创建成功！`);
    this.nzModalRef.close();
  }

  updateFlyout() {
    const formValue = this.createVariableForm.value;
    const tempVariable = new VariableGetBlock(
      `variables_get_${formValue.variableName}`, null, null,
      formValue.variableName, [formValue.variableType],
      formValue.variableType, formValue.variableName
    );
    const variableXml = tempVariable.toXML();
    Blockly.Blocks[tempVariable.type] = {
      init() {
        this.jsonInit(tempVariable.jsonBlock);
      }
    };
    Blockly.JavaScript[tempVariable.type] = (e: any) => {
      return tempVariable.toJavaScriptCode(e);
    };
    const treeControl = this.workspace.workspace.getToolbox().tree_; // 每次调用renderTree都会生成新的TreeControl
    const preSelectedItem = treeControl.getSelectedItem();
    // 更新toolbox
    // tslint:disable-next-line: no-string-literal
    const index = this.ngxToolboxBuilder.nodes.findIndex(item => item['name'] === '变量');
    this.blockly.variables.push(tempVariable);
    this.ngxToolboxBuilder.nodes[index] = new Category(
      [
        new CreateVariableButton('加载变量', 'loadVariables' ),
        new CreateVariableButton('创建变量', 'createAge' ),
        ...this.blockly.variables,
      ], '#FF00FF', '变量', null);
    const xml = Blockly.Xml.textToDom(`<xml>
    ${variableXml}
    </xml>`);
    preSelectedItem.blocks.push(...xml.children);
    this.workspace.workspace.getToolbox().refreshSelection();
  }

}
