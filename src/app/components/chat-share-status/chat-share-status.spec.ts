import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatShareStatus } from './chat-share-status';

describe('ChatShareStatus', () => {
  let component: ChatShareStatus;
  let fixture: ComponentFixture<ChatShareStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatShareStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatShareStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
