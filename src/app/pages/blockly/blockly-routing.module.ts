import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { BlocklyComponent } from './blockly.component';

const routes: Routes = [
  {path: '', component: BlocklyComponent  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlocklyRoutingModule { }
