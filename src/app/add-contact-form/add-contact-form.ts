import { Component,inject,OnInit } from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators} from '@angular/forms'


const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const MOBILE_RE = /^[6-9]\d{9}$/;            // Indian mobile: 10 digits, starts with 6-9
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;    // e.g. ABCDE1234F
const AADHAAR_RE = /^[2-9]\d{11}$/;          // 12 digits, cannot start with 0 or 1

const pattern = (re: RegExp, key: string): ValidatorFn => (c: AbstractControl): ValidationErrors | null =>
  !c.value || re.test(String(c.value)) ? null : { [key]: true };

const today = () => new Date().toISOString().slice(0, 10);
@Component({
  selector: 'app-add-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './add-contact-form.html',
  styleUrl: './add-contact-form.scss',
})
export class AddContactForm  implements OnInit{

  fb = inject(FormBuilder).nonNullable
  //  first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), pattern(NAME_RE, 'name')]],
  //     last_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), pattern(NAME_RE, 'name')]],
  //     emailId: ['', [Validators.required, Validators.maxLength(120), pattern(EMAIL_RE, 'email')]],
  //     age: [null as number | null, [Validators.required, Validators.min(18), Validators.max(100)]],
  //     gender: ['', [Validators.required]],
  //     mobilenumber: ['', [Validators.required, pattern(MOBILE_RE, 'mobile')]],
  //     pan_no: ['', [Validators.required, pattern(PAN_RE, 'pan')]],
  //     adhaar_no: ['', [Validators.required, pattern(AADHAAR_RE, 'aadhaar')]],
  //     status: [true],

  form!: FormGroup


  constructor(){
    this.form = this.fb.group({
      first_name:['',Validators.required,Validators.minLength(2),Validators.maxLength(50),Validators.pattern('')],
      last_name: ['',Validators.required,Validators.minLength(2),Validators.maxLength(50)],
      emailId:['',Validators.required],
      age:['',Validators.required],
      gender:['',Validators.required],
      mobilenumber:['',Validators.required],
      pan_no:['',Validators.required],
      adhaar_no:['',Validators.required],
      status:[true]

    })
    

  }

  ngOnInit(){
    
  }
  get f(){
    return this.form.controls;
  }
  showError(c:AbstractControl){
    return c.invalid && (c.touched || c.dirty)
  }
  // protected message(name:string): string|null{
  //   const c = (this.f as Record<string,AbstractControl>)[name];
  //   if(!c || !this.showError(c)){
  //     return null;
  //   }
  //   const e = c.errors ?? {};
  //   switch(name){
  //     case 'first_name':
  //     case 'last_name':{
  //       const label = name ==='first_name'?'First Name':'Last Name';
  //       if(e['required']) return `${label} is required.`;

  //     }
  //     case 'emailId':
  //       if(e['required']) return 'Email is required';
  //       return 'Enter a valid email,exa@ds.com'
  //     case 'age':
  //       if(e['required']) return 'Age is required';



  //   }
    

  //   return 'Invalid value'
  // }
  submit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      document.querySelector<HTMLElement>('app-contact-form .ng-invalid[id]')?.focus();
      return;
    }
  }


}
