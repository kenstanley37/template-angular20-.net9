import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Images } from './images';

describe('Images', () => {
  let component: Images;
  let fixture: ComponentFixture<Images>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Images]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Images);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
