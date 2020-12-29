import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleChooseDialogComponent } from './role-choose-dialog.component';

describe('RoleChooseDialogComponent', () => {
  let component: RoleChooseDialogComponent;
  let fixture: ComponentFixture<RoleChooseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoleChooseDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleChooseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
