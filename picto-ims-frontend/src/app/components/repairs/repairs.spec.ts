import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairStatus } from './repairstatus';

describe('RepairStatus', () => {
  let component: RepairStatus;
  let fixture: ComponentFixture<RepairStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepairStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepairStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
