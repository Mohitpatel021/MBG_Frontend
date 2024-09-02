import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseRecordedComponent } from './response-recorded.component';

describe('ResponseRecordedComponent', () => {
  let component: ResponseRecordedComponent;
  let fixture: ComponentFixture<ResponseRecordedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResponseRecordedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponseRecordedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
