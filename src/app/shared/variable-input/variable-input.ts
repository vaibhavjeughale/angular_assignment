import { Component, ElementRef, HostListener, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

interface Attr { label: string; }

const STANDARD: Attr[] = [
  'First Name', 'Last Name', 'Address', 'City', 'Country', 'Gender', 'Email', 'Phone Number', 'Date of Birth', 'Company',
].map((label) => ({ label }));

const CUSTOM: Attr[] = ['Order ID', 'Coupon Code', 'Store Name', 'Delivery Date'].map((label) => ({ label }));

const EMOJIS = ['😀', '😊', '😍', '🎉', '🪔', '✨', '🎁', '🛍️', '🔥', '💜', '👍', '🙏', '🎊', '💸', '📦', '⭐', '🚀', '❤️'];

@Component({
  selector: 'app-variable-input',
  imports: [ReactiveFormsModule],
  templateUrl: './variable-input.html',
  styleUrl: './variable-input.scss',
})
export class VariableInput {
  readonly control = input.required<FormControl<string>>();
  readonly inputId = input.required<string>();
  readonly placeholder = input('');
  readonly maxLength = input<number | null>(null);
  readonly showEmoji = input(false);
  readonly describedBy = input<string | null>(null);
  readonly invalid = input(false);

  protected readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly panel = signal<'vars' | 'emoji' | null>(null);
  protected readonly tab = signal<'standard' | 'custom'>('standard');
  protected readonly query = signal('');
  protected readonly emojis = EMOJIS;

  protected readonly visibleAttrs = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.tab() === 'standard' ? STANDARD : CUSTOM;
    return q ? list.filter((a) => a.label.toLowerCase().includes(q)) : list;
  });

  protected toggle(which: 'vars' | 'emoji') {
    this.panel.update((p) => (p === which ? null : which));
    this.query.set('');
  }

  protected insert(text: string) {
    const el = this.field().nativeElement;
    const ctrl = this.control();
    const value = ctrl.value ?? '';
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    let next = value.slice(0, start) + text + value.slice(end);
    const max = this.maxLength();
    if (max !== null && next.length > max) next = next.slice(0, max);
    ctrl.setValue(next);
    ctrl.markAsDirty();
    this.panel.set(null);
    queueMicrotask(() => {
      el.focus();
      const pos = Math.min(start + text.length, next.length);
      el.setSelectionRange(pos, pos);
    });
  }

  protected insertVariable(label: string) { this.insert(`{{${label}}}`); }

  @HostListener('document:click', ['$event'])
  protected onDocClick(e: MouseEvent) {
    if (this.panel() && !this.host.nativeElement.contains(e.target as Node)) this.panel.set(null);
  }

  @HostListener('keydown.escape')
  protected onEscape() { this.panel.set(null); }
}
