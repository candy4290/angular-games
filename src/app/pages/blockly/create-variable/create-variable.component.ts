import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-variable',
  templateUrl: './create-variable.component.html',
  styleUrls: ['./create-variable.component.scss']
})
export class CreateVariableComponent implements OnInit, AfterViewInit, OnDestroy {
  createVariableForm: FormGroup;
  @ViewChild('tplFooter', {static: true}) tplFooter: any;
  constructor(private nzModalRef: NzModalRef,
              private modalService: NzModalService,
              private fb: FormBuilder) {
                this.createVariableForm = this.fb.group({
                  variableName: new FormControl('', [Validators.required]),
                  variableType: new FormControl('', [Validators.required]),
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

  }

}
