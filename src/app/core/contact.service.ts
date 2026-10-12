import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { Contact, ContactPayload } from './contact.model';

export const CONTACT_API = 'https://65c0cfa6dc74300bce8cc64d.mockapi.io/Contact/profile';

/** Turns any HTTP failure into a friendly, human-readable message. */
export function toFriendlyError(err: unknown, action: string): Error {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return new Error(`Couldn't ${action}. Check your internet connection and try again.`);
    if (err.status === 404) return new Error(`Couldn't ${action}. That contact no longer exists.`);
    if (err.status === 429) return new Error(`Too many requests. Wait a moment and try again.`);
    if (err.status >= 500) return new Error(`Couldn't ${action}. The server had a problem, please try again shortly.`);
    return new Error(`Couldn't ${action} (error ${err.status}).`);
  }
  if (err instanceof Error && err.name === 'TimeoutError') {
    return new Error(`Couldn't ${action}. The request timed out.`);
  }
  return new Error(`Couldn't ${action}. Something unexpected happened.`);
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly REQUEST_TIMEOUT_MS = 15000;

  /** GET /Contact/profile */
  getAll(): Observable<Contact[]> {
    return this.http.get<Contact[]>(CONTACT_API).pipe(this.handle('load contacts'));
  }

  /** GET /Contact/profile/:id */
  getById(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${CONTACT_API}/${encodeURIComponent(id)}`).pipe(this.handle('load this contact'));
  }

  /** POST /Contact/profile */
  create(body: ContactPayload): Observable<Contact> {
    return this.http.post<Contact>(CONTACT_API, body).pipe(this.handle('create the contact'));
  }

  /** PUT /Contact/profile/:id */
  update(id: string, body: ContactPayload): Observable<Contact> {
    return this.http
      .put<Contact>(`${CONTACT_API}/${encodeURIComponent(id)}`, body)
      .pipe(this.handle('update the contact'));
  }

  /** DELETE /Contact/profile/:id */
  delete(id: string): Observable<Contact> {
    return this.http
      .delete<Contact>(`${CONTACT_API}/${encodeURIComponent(id)}`)
      .pipe(this.handle('delete the contact'));
  }

  private handle<T>(action: string) {
    return (source: Observable<T>) =>
      source.pipe(
        timeout(this.REQUEST_TIMEOUT_MS),
        catchError((err) => throwError(() => toFriendlyError(err, action))),
      );
  }
}
