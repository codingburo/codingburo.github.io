import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatActions } from './chat-actions';

describe('ChatActions', () => {
  let component: ChatActions;
  let fixture: ComponentFixture<ChatActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
