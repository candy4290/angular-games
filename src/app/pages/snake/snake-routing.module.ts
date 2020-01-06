import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SnakeComponent } from './snake.component';

const routes: Routes = [{ path: '', component: SnakeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SnakeRoutingModule { }
