import { NgModule } from '@angular/core';
import { BlocklyRoutingModule } from './blockly-routing.module';
import { BlocklyComponent } from './blockly.component';
import { SharedModule } from 'src/app/share/shared.module';
import { BlocklyService } from './blockly.service';
import { CreateVariableComponent } from './create-variable/create-variable.component';
import { RenameVariableComponent } from './rename-variable/rename-variable.component';



@NgModule({
  declarations: [
    BlocklyComponent,
    CreateVariableComponent,
    RenameVariableComponent,
    RenameVariableComponent,
  ],
  imports: [
    SharedModule,
    BlocklyRoutingModule,
  ],
  providers: [BlocklyService],
  entryComponents: [CreateVariableComponent, RenameVariableComponent]
})
export class BlocklyModule { }
