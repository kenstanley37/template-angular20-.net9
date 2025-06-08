import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleEdit } from './article-edit';

describe('ArticleEdit', () => {
  let component: ArticleEdit;
  let fixture: ComponentFixture<ArticleEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
