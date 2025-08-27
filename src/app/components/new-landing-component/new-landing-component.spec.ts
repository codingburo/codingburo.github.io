import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLandingComponent } from './new-landing-component';

describe('NewLandingComponent', () => {
  let component: NewLandingComponent;
  let fixture: ComponentFixture<NewLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewLandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
