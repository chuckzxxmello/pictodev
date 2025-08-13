import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Requisitions } from './requisitions';

describe('Requisitions', () => {
  let component: Requisitions;
  let fixture: ComponentFixture<Requisitions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Requisitions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Requisitions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
