import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact, ContactPayload } from '../../core/contact.model';
import { ContactService } from '../../core/contact.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ContactForm } from './contact-form/contact-form';

type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'newest' | 'oldest' | 'name';

@Component({
  selector: 'app-contacts',
  imports: [FormsModule, DatePipe, ContactForm],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts implements OnInit {
  private readonly api = inject(ContactService);
  private readonly toast = inject(ToastService);

  // list state
  protected readonly contacts = signal<Contact[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  // filters
  protected readonly search = signal('');
  protected readonly status = signal<StatusFilter>('all');
  protected readonly sort = signal<SortKey>('newest');

  // dialog state
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Contact | null>(null);
  protected readonly formLoading = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<string | null>(null);

  protected readonly deleteTarget = signal<Contact | null>(null);
  protected readonly deleting = signal(false);

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const st = this.status();
    let list = this.contacts().filter((c) => {
      if (st === 'active' && !c.status) return false;
      if (st === 'inactive' && c.status) return false;
      if (!q) return true;
      const hay = [c.first_name, c.last_name, `${c.first_name} ${c.last_name}`, c.emailId, c.mobilenumber, c.pan_no, c.adhaar_no, c.id]
        .map((x) => String(x ?? '').toLowerCase());
      return hay.some((h) => h.includes(q));
    });
    const key = this.sort();
    list = [...list].sort((a, b) => {
      if (key === 'name') return this.fullName(a).localeCompare(this.fullName(b));
      const d = String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''));
      return key === 'newest' ? -d || Number(b.id) - Number(a.id) : d || Number(a.id) - Number(b.id);
    });
    return list;
  });

  protected readonly counts = computed(() => {
    const all = this.contacts();
    return { total: all.length, active: all.filter((c) => c.status).length };
  });

  ngOnInit() { this.load(); }

  @HostListener('document:keydown.escape')
  protected onEscape() {
    if (this.deleteTarget()) this.cancelDelete();
    else if (this.formOpen()) this.closeForm();
  }

  // ---------- READ ----------
  protected load() {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.getAll().subscribe({
      next: (rows) => { this.contacts.set(Array.isArray(rows) ? rows : []); this.loading.set(false); },
      error: (e: Error) => { this.loadError.set(e.message); this.loading.set(false); },
    });
  }

  // ---------- CREATE ----------
  protected openCreate() {
    this.editingId.set(null);
    this.editing.set(null);
    this.formError.set(null);
    this.formLoading.set(false);
    this.formOpen.set(true);
  }

  // ---------- READ ONE + UPDATE ----------
  protected openEdit(c: Contact) {
    this.editingId.set(c.id);
    this.editing.set(null);
    this.formError.set(null);
    this.formLoading.set(true);
    this.formOpen.set(true);
    this.api.getById(c.id).subscribe({
      next: (fresh) => { this.editing.set(fresh); this.formLoading.set(false); },
      error: (e: Error) => { this.formError.set(e.message); this.formLoading.set(false); },
    });
  }

  protected closeForm() {
    if (this.saving()) return;
    this.formOpen.set(false);
  }

  protected onSave(body: ContactPayload) {
    this.saving.set(true);
    const id = this.editingId();
    const req = id ? this.api.update(id, body) : this.api.create(body);
    req.subscribe({
      next: (saved) => {
        this.contacts.update((list) => (id ? list.map((c) => (c.id === id ? saved : c)) : [saved, ...list]));
        this.saving.set(false);
        this.formOpen.set(false);
        this.toast.success(id ? `${saved.first_name} ${saved.last_name} was updated.` : `${saved.first_name} ${saved.last_name} was added.`);
      },
      error: (e: Error) => { this.saving.set(false); this.toast.error(e.message); },
    });
  }

  // ---------- DELETE ----------
  protected askDelete(c: Contact) { this.deleteTarget.set(c); }
  protected cancelDelete() { if (!this.deleting()) this.deleteTarget.set(null); }

  protected confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.api.delete(target.id).subscribe({
      next: () => {
        this.contacts.update((list) => list.filter((c) => c.id !== target.id));
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.toast.success(`${this.fullName(target)} was deleted.`);
      },
      error: (e: Error) => { this.deleting.set(false); this.toast.error(e.message); },
    });
  }

  // ---------- helpers ----------
  protected fullName(c: Contact) { return `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || 'Unnamed contact'; }
  protected initials(c: Contact) { return ((c.first_name?.[0] ?? '') + (c.last_name?.[0] ?? '')).toUpperCase() || '?'; }
  protected maskAadhaar(v: string) { return v && v.length >= 4 ? `•••• •••• ${v.slice(-4)}` : v || '—'; }
  protected clearFilters() { this.search.set(''); this.status.set('all'); }
  protected get hasFilters() { return !!this.search().trim() || this.status() !== 'all'; }
  protected readonly skeletons = [1, 2, 3, 4, 5];
}
