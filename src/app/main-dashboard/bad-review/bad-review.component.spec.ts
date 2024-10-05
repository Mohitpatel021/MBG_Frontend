import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadReviewComponent } from './bad-review.component';

describe('BadReviewComponent', () => {
  let component: BadReviewComponent;
  let fixture: ComponentFixture<BadReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BadReviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BadReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
