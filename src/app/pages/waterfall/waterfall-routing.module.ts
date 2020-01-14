import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WaterfallComponent } from './waterfall.component';

const routes: Routes = [{ path: '', component: WaterfallComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WaterfallRoutingModule { }
