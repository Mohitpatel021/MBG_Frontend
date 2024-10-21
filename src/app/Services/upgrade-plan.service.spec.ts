import { TestBed } from '@angular/core/testing';

import { UpgradePlanService } from './upgrade-plan.service';

describe('UpgradePlanService', () => {
  let service: UpgradePlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpgradePlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
