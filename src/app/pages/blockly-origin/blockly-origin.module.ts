import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlocklyOriginRoutingModule } from './blockly-origin-routing.module';
import { BlocklyOriginComponent } from './blockly-origin.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';


@NgModule({
  declarations: [BlocklyOriginComponent],
  imports: [
    CommonModule,
    BlocklyOriginRoutingModule,
    NgZorroAntdModule
  ]
})
export class BlocklyOriginModule { }
