import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Transfers } from './transfers';

describe('Transfers', () => {
  let component: Transfers;
  let fixture: ComponentFixture<Transfers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Transfers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Transfers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
