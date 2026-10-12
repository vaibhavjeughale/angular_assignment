import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'compose' },
  {
    path: 'compose',
    title: 'Compose Message',
    loadComponent: () => import('./pages/compose-message/compose-message').then((m) => m.ComposeMessage),
  },
  {
    path: 'contacts',
    title: 'Contacts',
    loadComponent: () => import('./pages/contacts/contacts').then((m) => m.Contacts),
  },
  { path: '**', redirectTo: 'compose' },
];
