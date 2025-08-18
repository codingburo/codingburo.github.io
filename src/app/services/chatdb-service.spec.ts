import { TestBed } from '@angular/core/testing';

import { ChatdbService } from './chatdb-service';

describe('ChatdbService', () => {
  let service: ChatdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
