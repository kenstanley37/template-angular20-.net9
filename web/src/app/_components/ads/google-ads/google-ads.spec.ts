import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleAds } from './google-ads';

describe('GoogleAds', () => {
  let component: GoogleAds;
  let fixture: ComponentFixture<GoogleAds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleAds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleAds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
