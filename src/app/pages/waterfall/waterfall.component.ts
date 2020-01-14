import { Component, OnInit, ViewChild, Inject, AfterViewInit, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss']
})
export class WaterfallComponent implements OnInit, AfterViewInit {
  @ViewChild('notice', {static: true}) notice: ElementRef;
  @ViewChild('cells', {static: true}) cells: ElementRef;
  MIN_COLUMN_COUNT = 3; // minimal column count
  COLUMN_WIDTH = 220;   // cell width: 190, padding: 14 * 2, border: 1 * 2
  CELL_PADDING = 26;    // cell padding: 14 + 10, border: 1 * 2
  GAP_HEIGHT = 15;      // vertical gap between cells
  GAP_WIDTH = 15;       // horizontal gap between cells
  THRESHOLD = 2000;     // determines whether a cell is too far away from viewport (px)

  columnHeights: number[];        // array of every column's height
  columnCount: number;          // number of columns
  noticeDelay: any;          // popup notice timer
  resizeDelay: any;          // resize throttle timer
  scrollDelay: any;          // scroll throttle timer
  managing = false;     // flag for managing cells state
  loading = false;      // flag for loading cells state
  imgNames = [];
  constructor(@Inject(DOCUMENT) private _document: HTMLDocument) { }

  ngOnInit() {
    this.initImgNames();
  }

  ngAfterViewInit() {
    this._document.addEventListener('resize', () => {this.delayedResize(); });
    this._document.addEventListener('scroll', () => {this.delayedScroll(); });
    this.columnCount = this.getColumnCount();
    this.resetHeights(this.columnCount);
    this.manageCells();
  }

  initImgNames() {
    for (let i = 0; i < 60; i++) {
      this.imgNames.push(i + 1);
    }
  }

  getMinVal(arr: number[]) {
    return Math.min(...arr);
  }

  getMaxVal(arr: number[]) {
    return Math.max(...arr);
  }

  getMixKey(arr: number[]) {
    return arr.indexOf(this.getMinVal(arr));
  }

  getMaxKey(arr: number[]) {
    return arr.indexOf(this.getMaxVal(arr));
  }


  /**
   * 计算当前列数
   *
   * @memberof WaterfallComponent
   */
  getColumnCount() {
    return Math.max(this.MIN_COLUMN_COUNT, Math.floor((this._document.body.offsetWidth + this.GAP_WIDTH) / (this.COLUMN_WIDTH + this.GAP_WIDTH)));
  }

  resetHeights(count: number) {
    this.columnHeights = [];
    for (let i = 0; i < count; i++) {
      this.columnHeights.push(0);
    }
    this.cells.nativeElement.style.width = count * (this.COLUMN_WIDTH + this.GAP_WIDTH) - this.GAP_WIDTH + 'px';
  }

  /**
   * 异步加载图片列表
   *
   * @param {number} num
   * @returns
   * @memberof WaterfallComponent
   */
  appendCells(num: number) {
    if (this.loading) {
      return;
    }
    const fragment = this._document.createDocumentFragment();
    const images = this.imgNames;
    const cells = [];
    images.forEach(image => {
      const cell = this._document.createElement('div');
      cell.className = 'cell ready';
      cells.push(cell);
      cell.innerHTML = `
        <p><a href="#"><img src="assets/img/${image}.jpg" height="${image.height}" width="${image.width}" /></a></p>
        <h2><a href="#">${image}</a></h2>
        <span class="like">Like!</span>
        <span class="mark">Mark!</span>
      `;
      fragment.appendChild(cell);
    });
    this.cells.nativeElement.appendChild(fragment);
  }

  adjustCells(cells: any[], reflow?: boolean) {
    let columnIndex: number;
    let columnHeight: number;
    cells.forEach(cell => {
      columnIndex = this.getMixKey(this.columnHeights);
      columnHeight = this.columnHeights[columnIndex];
      cell.style.height = (cell.offsetHeight - this.CELL_PADDING) + 'px';
      cell.style.left = columnIndex * (this.COLUMN_WIDTH + this.GAP_WIDTH) + 'px';
      cell.style.top = columnHeight + 'px';
      this.columnHeights[columnIndex] = columnHeight + this.GAP_HEIGHT + cell.offsetHeight;
      if (!reflow) {
        cell.className = 'cell ready';
      }
    });
    this.cells.nativeElement.style.height = this.getMaxVal(this.columnHeights) + 'px';
    this.manageCells();
  }

  reflowCells() {
    const columnCount = this.getColumnCount();
    if (this.columnHeights.length !== columnCount) {
      // Reset array of column heights and container width.
      this.resetHeights(columnCount);
      this.adjustCells(this.cells.nativeElement.children, true);
    } else {
      this.manageCells();
    }
  }

  manageCells() {
    this.managing = true;
    console.log(this.cells);
    const cells = (this.cells.nativeElement || this.cells).children;
    const viewportTop = (document.body.scrollTop || document.documentElement.scrollTop) - (this.cells.nativeElement || this.cells).style.offsetTop;
    const viewportBottom = (window.innerHeight || document.documentElement.clientHeight) + viewportTop;

    // Remove cells' contents if they are too far away from the viewport. Get them back if they are near.
    // TODO: remove the cells from DOM should be better :<
    for (let i = 0, l = cells.length; i < l; i++) {
      if ((cells[i].offsetTop - viewportBottom > this.THRESHOLD) || (viewportTop - cells[i].offsetTop - cells[i].offsetHeight > this.THRESHOLD)) {
        if (cells[i].className === 'cell ready') {
          cells[i].fragment = cells[i].innerHTML;
          cells[i].innerHTML = '';
          cells[i].className = 'cell shadow';
        }
      } else {
        if (cells[i].className === 'cell shadow') {
          cells[i].innerHTML = cells[i].fragment;
          cells[i].className = 'cell ready';
        }
      }
    }

    // If there's space in viewport for a cell, request new cells.
    if (viewportBottom > this.getMinVal(this.columnHeights)) {
      // Remove the if/else statement in your project, just call the appendCells function.
      this.appendCells(this.columnCount);
    }

    // Unlock managing state.
    this.managing = false;
  }

  delayedScroll() {
    clearTimeout(this.scrollDelay);
    if (!this.managing) {
      // Avoid managing cells for unnecessity.
      this.scrollDelay = setTimeout(this.manageCells, 500);
    }
  }

  delayedResize() {
    clearTimeout(this.resizeDelay);
    this.resizeDelay = setTimeout(this.reflowCells, 500);
  }

}
