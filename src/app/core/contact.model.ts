export type Gender = 'Male' | 'Female' | 'Other';

/** Exact request-body structure required by the assignment (POST / PUT). */
export interface ContactPayload {
  createdAt: string;
  first_name: string;
  last_name: string;
  emailId: string;
  age: number;
  gender: Gender | string;
  mobilenumber: number;
  pan_no: string;
  adhaar_no: string;
  status: boolean;
}

/** A contact as returned by the API (MockAPI adds an `id`). */
export interface Contact extends ContactPayload {
  id: string;
}
