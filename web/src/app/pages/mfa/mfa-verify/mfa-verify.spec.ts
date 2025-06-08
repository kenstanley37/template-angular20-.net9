import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfaVerify } from './mfa-verify';

describe('MfaVerify', () => {
  let component: MfaVerify;
  let fixture: ComponentFixture<MfaVerify>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfaVerify]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MfaVerify);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
