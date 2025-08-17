import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptComposer } from './prompt-composer';

describe('PromptComposer', () => {
  let component: PromptComposer;
  let fixture: ComponentFixture<PromptComposer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptComposer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptComposer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
