import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SnakeRoutingModule } from './snake-routing.module';
import { SnakeComponent } from './snake.component';


@NgModule({
  declarations: [SnakeComponent],
  imports: [
    CommonModule,
    SnakeRoutingModule
  ]
})
export class SnakeModule { }
