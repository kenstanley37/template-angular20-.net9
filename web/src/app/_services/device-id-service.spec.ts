import { TestBed } from '@angular/core/testing';

import { DeviceIdService } from './device-id-service';

describe('DeviceIdService', () => {
  let service: DeviceIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
