import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BlocklyOriginComponent } from './blockly-origin.component';

const routes: Routes = [{ path: '', component: BlocklyOriginComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlocklyOriginRoutingModule { }
