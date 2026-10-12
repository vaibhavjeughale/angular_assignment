import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/toast/toast.service';
import { VariableInput } from '../../shared/variable-input/variable-input';

const URL_RE = /^https?:\/\/[^\s/$.?#][^\s]*$/i;

/** Empty is allowed; otherwise must be http(s) URL. */
const optionalUrl: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c.value ?? '').toString().trim();
  if (!v || v === 'https://' || v === 'http://') return null;
  return URL_RE.test(v) ? null : { url: true };
};

/** Empty is allowed; otherwise must be a number in [min, max]. */
function optionalRange(min: number, max: number): ValidatorFn {
  return (c) => {
    const raw = (c.value ?? '').toString().trim();
    if (raw === '') return null;
    const n = Number(raw);
    if (Number.isNaN(n)) return { number: true };
    return n < min || n > max ? { range: { min, max } } : null;
  };
}

@Component({
  selector: 'app-compose-message',
  imports: [ReactiveFormsModule, VariableInput],
  templateUrl: './compose-message.html',
  styleUrl: './compose-message.scss',
})
export class ComposeMessage {
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly template = {
    name: 'Diwali Sale',
    id: '5798525851493',
    type: 'Text and Rich Media',
    language: 'English',
  };

  protected readonly form = new FormGroup({
    imageUrl: new FormControl('', { nonNullable: true, validators: [optionalUrl, Validators.maxLength(2048)] }),
    videoUrl: new FormControl('', { nonNullable: true, validators: [optionalUrl, Validators.maxLength(2048)] }),
    documentUrl: new FormControl('', { nonNullable: true, validators: [optionalUrl, Validators.maxLength(2048)] }),
    latitude: new FormControl('', { nonNullable: true, validators: [optionalRange(-90, 90)] }),
    longitude: new FormControl('', { nonNullable: true, validators: [optionalRange(-180, 180)] }),
    var1: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    var2: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    yesPayload: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(128)] }),
    noPayload: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(128)] }),
    unsubscribePayload: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(128)] }),
    visitUrlParam: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(128)] }),
  });

  protected readonly v1 = '{{1}}';
  protected readonly v2 = '{{2}}';
  protected readonly submitted = signal(false);

  protected get c() { return this.form.controls; }

  /** True when the field should show its error (touched, dirty or after submit attempt). */
  protected showError(ctrl: AbstractControl): boolean {
    return ctrl.invalid && (ctrl.touched || ctrl.dirty || this.submitted());
  }

  protected urlError(ctrl: AbstractControl): string | null {
    if (!this.showError(ctrl)) return null;
    if (ctrl.hasError('url')) return 'Enter a valid link that starts with http:// or https://';
    if (ctrl.hasError('maxlength')) return 'Links can be up to 2048 characters.';
    return null;
  }

  protected rangeError(ctrl: AbstractControl, label: string): string | null {
    if (!this.showError(ctrl)) return null;
    if (ctrl.hasError('number')) return `${label} must be a number.`;
    if (ctrl.hasError('range')) {
      const { min, max } = ctrl.getError('range');
      return `${label} must be between ${min} and ${max}.`;
    }
    return null;
  }

  protected len(ctrl: AbstractControl): number {
    return (ctrl.value ?? '').length;
  }

  protected goBack() { history.length > 1 ? history.back() : this.router.navigateByUrl('/'); }

  protected cancel() {
    this.form.reset();
    this.submitted.set(false);
    this.toast.info('Changes discarded.');
  }

  protected done() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.error('Fix the highlighted fields before finishing.');
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"], input.ng-invalid');
      first?.focus();
      return;
    }
    this.toast.success('Message composed and ready to send.');
  }
}
