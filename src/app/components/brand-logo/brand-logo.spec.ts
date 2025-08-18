import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandLogo } from './brand-logo';

describe('BrandLogo', () => {
  let component: BrandLogo;
  let fixture: ComponentFixture<BrandLogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandLogo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandLogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
