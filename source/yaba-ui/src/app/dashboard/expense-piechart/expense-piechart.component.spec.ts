import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePiechartComponent } from './expense-piechart.component';

describe('ExpensePiechartComponent', () => {
  let component: ExpensePiechartComponent;
  let fixture: ComponentFixture<ExpensePiechartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpensePiechartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensePiechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
