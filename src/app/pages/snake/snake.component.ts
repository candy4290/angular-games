import { Component, OnInit } from '@angular/core';
import { GameMap } from './model/map.model';
import { Food } from './model/food.model';
import { Snack } from './model/snack.model';
import { fromEvent, timer } from 'rxjs';
import { filter, tap, map } from 'rxjs/operators';
import { RIGHT_ARROW, LEFT_ARROW, UP_ARROW, DOWN_ARROW } from '@angular/cdk/keycodes';
import { NzMessageService } from 'ng-zorro-antd';

/**
 * 贪吃蛇---思路
 * 由棋盘，蛇（数组，每吃一个食物长度加1），食物（位置随机生成）
 *
 * @export
 * @class SnakeComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.scss']
})
export class SnakeComponent implements OnInit {
  score = 0; // 得分
  startMove = false; // 蛇是否在动
  map: GameMap; // 棋盘
  currentFood: Food; // 食物
  snack: Snack; // 蛇
  lastArrow: number; // 上一次的按键code
  gameStatus: 'init' | 'start' | 'stop' | 'end' = 'init'; // 游戏状态
  constructor(private messageService: NzMessageService) { }

  ngOnInit() {
    this.map = new GameMap();
    this.snack = new Snack();
    this.currentFood = new Food(this.map);
    timer(0, this.snack.speed).pipe(
      filter(() => this.startMove),
      filter(() => !!this.lastArrow),
    ).subscribe(() => {
      // 移动蛇
      const canEat = this.snack.canEat(this.currentFood, this.lastArrow);
      if (canEat) {
        const score = this.snack.eat(this.currentFood);
        this.currentFood.fresh(this.snack);
        this.score += score;
      } else {
        this.snack.move(this.lastArrow);
      }
      if (this.snack.invalid()) {
        this.startMove = false;
        this.messageService.error('你挂了！');
      }
    });
    fromEvent(document, 'keyup').pipe(
      // filter(() => this.gameStatus === 'start'),
      tap((event: KeyboardEvent) => {
        event.preventDefault(); // 无效
      }),
      map((event: any) => event.keyCode),
      tap(() => this.startMove = true)
    ).subscribe(keyCode => {
      console.log(keyCode);
      if (this.lastArrow === RIGHT_ARROW && keyCode === LEFT_ARROW) {
        return;
      }
      if (this.lastArrow === LEFT_ARROW && keyCode === RIGHT_ARROW) {
        return;
      }
      if (this.lastArrow === UP_ARROW && keyCode === DOWN_ARROW) {
        return;
      }
      if (this.lastArrow === DOWN_ARROW && keyCode === UP_ARROW) {
        return;
      }
      this.lastArrow = keyCode;
    });
  }

}
