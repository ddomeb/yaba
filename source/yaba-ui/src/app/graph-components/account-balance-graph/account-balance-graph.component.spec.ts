import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBalanceGraphComponent } from './account-balance-graph.component';

describe('AccountBalanceGraphComponent', () => {
  let component: AccountBalanceGraphComponent;
  let fixture: ComponentFixture<AccountBalanceGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountBalanceGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBalanceGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
