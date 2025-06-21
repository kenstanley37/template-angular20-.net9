import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteAccount } from './confirm-delete-account';

describe('ConfirmDeleteAccount', () => {
  let component: ConfirmDeleteAccount;
  let fixture: ComponentFixture<ConfirmDeleteAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDeleteAccount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
