import { Component, afterNextRender, effect, inject, input, output } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Contact, ContactPayload } from '../../../core/contact.model';

const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const MOBILE_RE = /^[6-9]\d{9}$/;            // Indian mobile: 10 digits, starts with 6-9
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;    // e.g. ABCDE1234F
const AADHAAR_RE = /^[2-9]\d{11}$/;          // 12 digits, cannot start with 0 or 1

const pattern = (re: RegExp, key: string): ValidatorFn => (c: AbstractControl): ValidationErrors | null =>
  !c.value || re.test(String(c.value)) ? null : { [key]: true };

const today = () => new Date().toISOString().slice(0, 10);

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  private readonly fb = inject(FormBuilder).nonNullable;

  /** Contact being edited; null when creating. */
  readonly contact = input<Contact | null>(null);
  readonly saving = input(false);

  readonly save = output<ContactPayload>();
  readonly cancel = output<void>();

  protected readonly form = this.fb.group({
    first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), pattern(NAME_RE, 'name')]],
    last_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), pattern(NAME_RE, 'name')]],
    emailId: ['', [Validators.required, Validators.maxLength(120), pattern(EMAIL_RE, 'email')]],
    age: [null as number | null, [Validators.required, Validators.min(18), Validators.max(100)]],
    gender: ['', [Validators.required]],
    mobilenumber: ['', [Validators.required, pattern(MOBILE_RE, 'mobile')]],
    pan_no: ['', [Validators.required, pattern(PAN_RE, 'pan')]],
    adhaar_no: ['', [Validators.required, pattern(AADHAAR_RE, 'aadhaar')]],
    status: [true],
  });

  constructor() {
    afterNextRender(() => document.getElementById('first_name')?.focus());
    effect(() => {
      const c = this.contact();
      this.form.reset({
        first_name: c?.first_name ?? '',
        last_name: c?.last_name ?? '',
        emailId: c?.emailId ?? '',
        age: c?.age ?? null,
        gender: c?.gender ?? '',
        mobilenumber: c?.mobilenumber != null ? String(c.mobilenumber) : '',
        pan_no: c?.pan_no ?? '',
        adhaar_no: c?.adhaar_no ?? '',
        status: c?.status ?? true,
      });
      // Existing records may contain data that fails our stricter rules; show that straight away.
      if (c) this.form.markAllAsTouched();
    });
  }

  protected get f() { return this.form.controls; }

  protected showError(c: AbstractControl) { return c.invalid && (c.touched || c.dirty); }

  protected upper(name: 'pan_no') {
    const ctrl = this.f[name];
    const v = ctrl.value.toUpperCase().replace(/\s/g, '');
    if (v !== ctrl.value) ctrl.setValue(v);
  }

  protected digitsOnly(name: 'mobilenumber' | 'adhaar_no') {
    const ctrl = this.f[name];
    const v = ctrl.value.replace(/\D/g, '');
    if (v !== ctrl.value) ctrl.setValue(v);
  }

  protected message(name: string): string | null {
    const c = (this.f as Record<string, AbstractControl>)[name];
    if (!c || !this.showError(c)) return null;
    const e = c.errors ?? {};
    switch (name) {
      case 'first_name':
      case 'last_name': {
        const label = name === 'first_name' ? 'First name' : 'Last name';
        if (e['required']) return `${label} is required.`;
        if (e['minlength']) return `${label} must be at least 2 characters.`;
        if (e['maxlength']) return `${label} can be at most 50 characters.`;
        return `${label} can only contain letters, spaces, . ' and -.`;
      }
      case 'emailId':
        if (e['required']) return 'Email is required.';
        return 'Enter a valid email, for example name@example.com.';
      case 'age':
        if (e['required']) return 'Age is required.';
        return 'Age must be between 18 and 100.';
      case 'gender':
        return 'Select a gender.';
      case 'mobilenumber':
        if (e['required']) return 'Mobile number is required.';
        return 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.';
      case 'pan_no':
        if (e['required']) return 'PAN is required.';
        return 'PAN must be 10 characters: 5 letters, 4 digits, 1 letter (ABCDE1234F).';
      case 'adhaar_no':
        if (e['required']) return 'Aadhaar number is required.';
        return 'Aadhaar must be 12 digits and cannot start with 0 or 1.';
    }
    return 'Invalid value.';
  }

  protected submit() {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      document.querySelector<HTMLElement>('app-contact-form .ng-invalid[id]')?.focus();
      return;
    }
    const v = this.form.getRawValue();
    const existing = this.contact();
    this.save.emit({
      createdAt: existing?.createdAt ?? today(),
      first_name: v.first_name.trim(),
      last_name: v.last_name.trim(),
      emailId: v.emailId.trim().toLowerCase(),
      age: Number(v.age),
      gender: v.gender,
      mobilenumber: Number(v.mobilenumber),
      pan_no: v.pan_no,
      adhaar_no: v.adhaar_no,
      status: v.status,
    });
  }
}
