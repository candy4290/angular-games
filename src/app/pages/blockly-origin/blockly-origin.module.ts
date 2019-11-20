import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlocklyOriginRoutingModule } from './blockly-origin-routing.module';
import { BlocklyOriginComponent } from './blockly-origin.component';


@NgModule({
  declarations: [BlocklyOriginComponent],
  imports: [
    CommonModule,
    BlocklyOriginRoutingModule
  ]
})
export class BlocklyOriginModule { }
