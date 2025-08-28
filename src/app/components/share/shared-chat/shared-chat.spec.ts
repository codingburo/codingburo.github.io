import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedChat } from './shared-chat';

describe('SharedChat', () => {
  let component: SharedChat;
  let fixture: ComponentFixture<SharedChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
