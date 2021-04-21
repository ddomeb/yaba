import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBalanceHistoryComponent } from './account-balance-history.component';

describe('AccountBalanceHistoryComponent', () => {
  let component: AccountBalanceHistoryComponent;
  let fixture: ComponentFixture<AccountBalanceHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountBalanceHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBalanceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
