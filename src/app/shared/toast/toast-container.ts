import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="stack" aria-live="polite" aria-atomic="false">
      @for (t of toasts.toasts(); track t.id) {
        <div class="toast" [class]="t.kind" [attr.role]="t.kind === 'error' ? 'alert' : 'status'">
          <span class="dot" aria-hidden="true"></span>
          <span class="msg">{{ t.message }}</span>
          <button type="button" class="close" (click)="toasts.dismiss(t.id)" aria-label="Dismiss notification">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .stack { position: fixed; right: 16px; bottom: 16px; z-index: 100; display: grid; gap: 8px; width: min(380px, calc(100vw - 32px)); }
    .toast { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 10px; background: #1f2140; color: #fff; box-shadow: 0 10px 30px rgba(31,33,64,.25); animation: in .18s ease-out; }
    .dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex: none; background: #9aa0c8; }
    .success .dot { background: #3ddc97; }
    .error .dot { background: #ff6b81; }
    .msg { flex: 1; font-size: 14px; }
    .close { background: none; border: 0; color: #c9cbe3; font-size: 20px; line-height: 1; padding: 0 2px; }
    @keyframes in { from { transform: translateY(8px); opacity: 0; } to { transform: none; opacity: 1; } }
  `,
})
export class ToastContainer {
  protected readonly toasts = inject(ToastService);
}
