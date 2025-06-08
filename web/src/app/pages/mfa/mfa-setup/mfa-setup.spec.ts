import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfaSetup } from './mfa-setup';

describe('MfaSetup', () => {
  let component: MfaSetup;
  let fixture: ComponentFixture<MfaSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfaSetup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MfaSetup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
