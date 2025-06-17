import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteOffline } from './site-offline';

describe('SiteOffline', () => {
  let component: SiteOffline;
  let fixture: ComponentFixture<SiteOffline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteOffline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteOffline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
