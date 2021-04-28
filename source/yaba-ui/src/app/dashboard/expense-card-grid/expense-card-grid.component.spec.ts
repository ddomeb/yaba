import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCardGridComponent } from './expense-card-grid.component';

describe('ExpenseCardGridComponent', () => {
  let component: ExpenseCardGridComponent;
  let fixture: ComponentFixture<ExpenseCardGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpenseCardGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseCardGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
