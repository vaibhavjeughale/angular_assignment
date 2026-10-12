# Frontend Developer Practical Assignment (Round 2), Angular 20

One Angular 20 project (standalone components, signals, reactive forms, new control flow) that delivers both tasks.

| Route | Task |
|-------|------|
| `/compose`  | **Task 1**: responsive "Customize Your Message" UI from the Figma / image design |
| `/contacts` | **Task 2**: contact manager with full CRUD, validation, search/filter, loading states, toasts |

## Run it

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build -> dist/angular-assignment/browser
```

Requires Node 20.19+ (or 22) and npm.

## Task 1: Compose Message
- Breadcrumb, back button, title/subtitle, template meta row, three cards (Header, Message, Buttons) and the footer with **Cancel** / **Done composing**, matching the provided design.
- Working `{ }` **variable picker** (search, Standard / Custom tabs) and **emoji picker**. Choosing an item inserts it at the cursor and respects the max length.
- Live character counters (`0/2048`, `0/128`), URL validation for image/video/document, latitude (-90..90) and longitude (-180..180) range validation, required variables `{{1}}` / `{{2}}`.
- Hover, focus and active states on every control; keyboard accessible; Escape closes pickers.
- Breakpoints: desktop (>900px), tablet (<=900px), mobile (<=600px).

## Task 2: Contacts (CRUD)
API base: `https://65c0cfa6dc74300bce8cc64d.mockapi.io/Contact/profile` (`src/app/core/contact.service.ts`).

| Action | Request | Where |
|--------|---------|-------|
| List | `GET /Contact/profile` | page load / "Try again" |
| Read one | `GET /Contact/profile/:id` | when you open **Edit** (form is filled from the fresh record) |
| Create | `POST /Contact/profile` | **Add contact** |
| Update | `PUT /Contact/profile/:id` | **Save changes** |
| Delete | `DELETE /Contact/profile/:id` | delete confirmation dialog |

IDs are always taken from the record, never hard-coded. The POST/PUT body is exactly the required structure:
`createdAt, first_name, last_name, emailId, age, gender, mobilenumber, pan_no, adhaar_no, status`.

**Validation** (`contact-form.ts`): required fields; names 2-50 letters; email format; age 18-100; gender required; mobile = 10 digits starting 6-9; PAN = `ABCDE1234F` (5 letters, 4 digits, 1 letter, auto-uppercased); Aadhaar = 12 digits, not starting 0/1. Errors appear per field with plain-language messages.

> Note: the sample record in the assignment (`pan_no: "CGBPA001"`) is 8 characters, which is not a valid PAN. Existing records like it load fine in the list, but when you edit one the form flags the PAN so it gets corrected.

**Also included:** loading skeletons + button spinners, list-level error state with retry, 15s request timeout, friendly error messages (offline / 404 / 429 / 5xx), toast notifications for every action, search (name, email, mobile, PAN, Aadhaar, id), status filter, sorting, delete confirmation, accessible dialogs (Escape to close, focus on first field).

## Project structure
```
src/app
  core/        contact.model.ts, contact.service.ts (API + error mapping)
  shared/      toast/ (service + container), variable-input/ (reusable input with {} and emoji pickers)
  pages/
    compose-message/   Task 1
    contacts/          Task 2 (+ contact-form/)
docs/
  screenshots/  375 / 768 / 1440px for both tasks, plus validation + picker states
  lighthouse/   Lighthouse HTML reports
```

## Deploy (live demo URL)
`vercel.json`, `netlify.toml` and `public/_redirects` are included for SPA routing. Import the repo in Vercel or Netlify (build command `npm run build`) or run `npx vercel`.

## Lighthouse
Reports are in `docs/lighthouse/`. Those were generated against a local, uncompressed static server, so **re-run Lighthouse on your deployed URL** and replace them for the most accurate performance score. Accessibility and SEO both scored 100 locally.
