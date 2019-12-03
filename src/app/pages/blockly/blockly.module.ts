import { NgModule } from '@angular/core';
import { BlocklyRoutingModule } from './blockly-routing.module';
import { BlocklyComponent } from './blockly.component';
import { SharedModule } from 'src/app/share/shared.module';
import { BlocklyService } from './blockly.service';
import { CreateVariableComponent } from './create-variable/create-variable.component';



@NgModule({
  declarations: [
    BlocklyComponent,
    CreateVariableComponent,
  ],
  imports: [
    SharedModule,
    BlocklyRoutingModule,
  ],
  providers: [BlocklyService],
  entryComponents: [CreateVariableComponent]
})
export class BlocklyModule { }
