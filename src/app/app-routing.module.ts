import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {path: 'blockly', loadChildren: () => import('./pages/blockly/blockly.module').then(mod => mod.BlocklyModule)},
  {path: 'puzzle', loadChildren: () => import('./pages/puzzle/puzzle.module').then(mod => mod.PuzzleModule)},
  { path: 'snake', loadChildren: () => import('./pages/snake/snake.module').then(m => m.SnakeModule) },
  { path: 'waterfall', loadChildren: () => import('./pages/waterfall/waterfall.module').then(m => m.WaterfallModule) },
  {path: '', redirectTo: 'blockly', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
