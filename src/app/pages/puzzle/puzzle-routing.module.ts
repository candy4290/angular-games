import { Routes, RouterModule } from '@angular/router';
import { PuzzleComponent } from './puzzle.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {path: '', component: PuzzleComponent  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PuzzleRoutingModule { }
