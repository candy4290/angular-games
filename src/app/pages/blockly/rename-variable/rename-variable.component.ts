import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-rename-variable',
  templateUrl: './rename-variable.component.html',
  styleUrls: ['./rename-variable.component.scss']
})
export class RenameVariableComponent implements OnInit {
  renameVariableForm: FormGroup;
  defaultValue: string; // 变量现在的名称
  constructor(private fb: FormBuilder) {
    this.renameVariableForm = this.fb.group({
      variableName: new FormControl(this.defaultValue, [Validators.required])
    });
  }

  ngOnInit() {
  }

}
