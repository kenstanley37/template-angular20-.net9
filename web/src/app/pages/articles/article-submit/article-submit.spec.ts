import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleSubmit } from './article-submit';

describe('ArticleSubmit', () => {
  let component: ArticleSubmit;
  let fixture: ComponentFixture<ArticleSubmit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleSubmit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleSubmit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
