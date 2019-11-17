import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * 思路1---监听上下左右, 用rx来实现；来交换棋子的位置
 * 思路2---监听棋子的拖拽，判断哪些可以拖拽，可以拖拽的进行位置交换
 *
 * @export
 * @class PuzzleComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.scss']
})
export class PuzzleComponent implements OnInit, OnDestroy {
  steps = 0;
  emptyIndex = [0, 0];
  newArray2 = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, '']
  ];
  @ViewChild('puzzle', { static: true }) puzzle: HTMLElement;
  private subscription$ = new Subscription();
  constructor() {
  }

  ngOnInit() {
    this.randomSort();
    const keyup$ = fromEvent(window, 'keyup').pipe(
      filter((r: any) => (r.keyCode === 37 || r.keyCode === 38 || r.keyCode === 39 || r.keyCode === 40))
    ).subscribe(rsp => {
      this.watchBorderDown(rsp);
    });
    this.subscription$.add(keyup$);
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }

  /**
   * 洗牌算法---一维数组
   *
   * @memberof PuzzleComponent
   */
  refreshCard(array: any[]) {
    let i = array.length;
    while (i) {
      const j = Math.floor(Math.random() * i--);
      [array[j], array[i]] = [array[i], array[j]];
    }
  }


  /**
   * 洗牌
   *
   * @memberof PuzzleComponent
   */
  randomSort() {
    const tempArr = this.newArray2.join().split(','); // 二维数组转一维
    this.refreshCard(tempArr);
    tempArr.forEach((item: any, index: number) => {
      if (!item) {
        this.emptyIndex = [Math.floor(index / 3), index % 3];
      }
      this.newArray2[Math.floor(index / 3)][index % 3] = item;
    });
    this.steps = 0;
  }

  keyup(e: any) {
    console.log(e);
  }

  drop(event: CdkDragDrop<string[]>) {
    // moveItemInArray(this.newArray, event.previousIndex, event.currentIndex);
  }

  watchBorderDown(e: any) {
    console.log(e.keyCode);
    switch (e.keyCode) {
      case 38:
        // 上
        if (this.emptyIndex[0] === 2) {
          alert('当前位置无法向上移动');
          return;
        }
        // 交互
        this.newArray2[this.emptyIndex[0]][this.emptyIndex[1]] = this.newArray2[this.emptyIndex[0] + 1][this.emptyIndex[1]]
        this.newArray2[this.emptyIndex[0] + 1][this.emptyIndex[1]] = '';
        this.emptyIndex = [this.emptyIndex[0] + 1, this.emptyIndex[1]];
        this.check();
        break;
      case 40:
        // 下
        if (!this.emptyIndex[0]) {
          alert('当前位置无法向下移动');
          return;
        }
        this.newArray2[this.emptyIndex[0]][this.emptyIndex[1]] = this.newArray2[this.emptyIndex[0] - 1][this.emptyIndex[1]]
        this.newArray2[this.emptyIndex[0] - 1][this.emptyIndex[1]] = '';
        this.emptyIndex = [this.emptyIndex[0] - 1, this.emptyIndex[1]];
        this.check();
        break;
      case 37:
        // 左
        if (this.emptyIndex[1] === 2) {
          alert('当前位置无法向左移动');
          return;
        }
        this.newArray2[this.emptyIndex[0]][this.emptyIndex[1]] = this.newArray2[this.emptyIndex[0]][this.emptyIndex[1] + 1]
        this.newArray2[this.emptyIndex[0]][this.emptyIndex[1] + 1] = '';
        this.emptyIndex = [this.emptyIndex[0], this.emptyIndex[1] + 1];
        this.check();
        break;
      case 39:
        // 右
        if (!this.emptyIndex[1]) {
          alert('当前位置无法向右移动');
          return;
        }
        this.newArray2[this.emptyIndex[0]][this.emptyIndex[1]] = this.newArray2[this.emptyIndex[0]][this.emptyIndex[1] - 1]
        this.newArray2[this.emptyIndex[0]][this.emptyIndex[1] - 1] = '';
        this.emptyIndex = [this.emptyIndex[0], this.emptyIndex[1] - 1];
        this.check();
        break;
    }
  }

  check() {
    this.steps++;
    if (this.checkIfSuccess()) {
      alert('恭喜你，成功啦！');
    }
  }



  checkIfSuccess() {
    return !this.newArray2[2][2] && this.newArray2.join().split(',').join('') === '12345678';
  }

}
