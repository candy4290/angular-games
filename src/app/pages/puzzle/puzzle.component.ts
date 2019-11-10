import { Component, OnInit } from '@angular/core';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.scss']
})
export class PuzzleComponent implements OnInit {
  newArray = [];
  constructor() { }

  ngOnInit() {
    this.randomSort();
  }

  randomSort() {
    this.newArray = [1, 2, 3, 4, 5, 6, 7, 8].sort(() => {
      return Math.random() - 0.5;
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    // moveItemInArray(this.newArray, event.previousIndex, event.currentIndex);
  }

}
