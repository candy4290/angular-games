import { NgModule } from '@angular/core';
import { BlocklyRoutingModule } from './blockly-routing.module';
import { BlocklyComponent } from './blockly.component';
import { SharedModule } from 'src/app/share/shared.module';



@NgModule({
  declarations: [
    BlocklyComponent,
  ],
  imports: [
    SharedModule,
    BlocklyRoutingModule,
  ]
})
export class BlocklyModule { }
