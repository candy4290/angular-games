import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocklyOriginComponent } from './blockly-origin.component';

describe('BlocklyOriginComponent', () => {
  let component: BlocklyOriginComponent;
  let fixture: ComponentFixture<BlocklyOriginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlocklyOriginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocklyOriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
