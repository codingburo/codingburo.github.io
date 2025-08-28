import { TestBed } from '@angular/core/testing';

import { ChatInteractionsService } from './chat-interactions-service';

describe('ChatInterations', () => {
  let service: ChatInteractionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatInteractionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
