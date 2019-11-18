import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlocklyRoutingModule } from './blockly-routing.module';
import { BlocklyComponent } from './blockly.component';
import { NgxBlocklyModule } from 'ngx-blockly';



@NgModule({
  declarations: [
    BlocklyComponent
  ],
  imports: [
    CommonModule,
    BlocklyRoutingModule,
    NgxBlocklyModule
  ]
})
export class BlocklyModule { }
