import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureViewer } from './picture-viewer';

describe('PictureViewer', () => {
  let component: PictureViewer;
  let fixture: ComponentFixture<PictureViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PictureViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PictureViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
