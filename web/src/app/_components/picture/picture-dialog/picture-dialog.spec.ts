import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureDialog } from './picture-dialog';

describe('PictureDialog', () => {
  let component: PictureDialog;
  let fixture: ComponentFixture<PictureDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PictureDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PictureDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
