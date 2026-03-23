import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CProgressSpinnerComponent } from './c-progress-spinner.component';

describe('CProgressSpinnerComponent', () => {
  let component: CProgressSpinnerComponent;
  let fixture: ComponentFixture<CProgressSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CProgressSpinnerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CProgressSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
