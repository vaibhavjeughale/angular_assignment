import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastContainer } from './shared/toast/toast-container';
import { AddContactForm } from './add-contact-form/add-contact-form';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink,FormsModule,ReactiveFormsModule,CommonModule, RouterLinkActive, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit{
  searchtext= '';
  serachControl = new FormControl('')
apiUrl = 'https://jsonplaceholder.typicode.com/users'
http = inject(HttpClient)



 contacts = [
  { first_name: "Vaibhav", emailId: "vaibhav@gmail.com" },
  { first_name: "Rahul", emailId: "rahul@gmail.com" },
  { first_name: "Priya", emailId: "priya@gmail.com" }
];
filterArr = [...this.contacts]
data:any;

ngOnInit() {
  this.serachControl.valueChanges.pipe(
    debounceTime(3000),
    switchMap((search)=>{
      return this.http.get(this.apiUrl)

    })
  ).subscribe(data=>{
    const search = this.serachControl.value?.toLowerCase();
    const myArr = Object.values(data)
    this.data = [...myArr]
    this.data = myArr.filter(item=>(item.username).toLowerCase().includes(search)

    )

  })
  // this.http.get(this.apiUrl).subscribe(res=>{
  //   this.data = res;
  //   console.log(this.data)
  // })
}
filterSe(){
  this.filterArr = this.contacts.filter((item)=>(item.first_name).toLocaleLowerCase().includes(this.searchtext.toLocaleLowerCase()) || item.emailId.toLocaleLowerCase().includes(this.searchtext.toLocaleLowerCase())
  )
}
}
