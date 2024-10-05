import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateUsComponent } from './rate-us.component';

describe('RateUsComponent', () => {
  let component: RateUsComponent;
  let fixture: ComponentFixture<RateUsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RateUsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RateUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
