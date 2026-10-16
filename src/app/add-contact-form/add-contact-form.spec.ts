import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContactForm } from './add-contact-form';

describe('AddContactForm', () => {
  let component: AddContactForm;
  let fixture: ComponentFixture<AddContactForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContactForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddContactForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
