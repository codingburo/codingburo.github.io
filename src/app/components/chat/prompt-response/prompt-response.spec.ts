import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptResponse } from './prompt-response';

describe('PromptResponse', () => {
  let component: PromptResponse;
  let fixture: ComponentFixture<PromptResponse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptResponse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptResponse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
