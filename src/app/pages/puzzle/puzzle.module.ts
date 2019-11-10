import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuzzleComponent } from './puzzle.component';
import { PuzzleRoutingModule } from './puzzle-routing.module';
import { BlockComponent } from './block/block.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
@NgModule({
  imports: [
    CommonModule,
    PuzzleRoutingModule,
    DragDropModule
  ],
  declarations: [PuzzleComponent, BlockComponent]
})
export class PuzzleModule { }
