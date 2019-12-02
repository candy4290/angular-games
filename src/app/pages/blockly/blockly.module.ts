import { NgModule } from '@angular/core';
import { BlocklyRoutingModule } from './blockly-routing.module';
import { BlocklyComponent } from './blockly.component';
import { SharedModule } from 'src/app/share/shared.module';
import { BlocklyService } from './blockly.service';



@NgModule({
  declarations: [
    BlocklyComponent,
  ],
  imports: [
    SharedModule,
    BlocklyRoutingModule,
  ],
  providers: [BlocklyService]
})
export class BlocklyModule { }
