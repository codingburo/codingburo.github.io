import { TestBed } from '@angular/core/testing';

import { EmailVerifyGuard } from './email-verify-guard';

describe('EmailVerifyGuard', () => {
  let service: EmailVerifyGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailVerifyGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
