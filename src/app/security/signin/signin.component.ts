import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SecurityService } from '../security.service';

export interface SessionUser {
  empId: number;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  errorMessage: string;
  sessionUser: SessionUser;
  isLoading: boolean = false;

  signinForm = this.fb.group({
    empId: [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])]
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private securityService: SecurityService
  ) {
    this.sessionUser = {} as SessionUser; // initialize the session user object
    this.errorMessage = ''; // initialize the error message
  }

  signin() {
    this.isLoading = true; // set the loading state to true
    console.log("signinForm", this.signinForm.value);
    const empId = this.signinForm.controls['empId'].value; // get the employee id from the form

    if (!empId || isNaN(parseInt(empId, 10))) {
      this.errorMessage = 'Please enter a valid employee ID'; // set the error message
      this.isLoading = false; // set the loading state to false
      return; // return from the function  
  }

  this.securityService.findEmployeeById(empId).subscribe({
    next: (employee: any) => {
      console.log('employee', employee);

      this.sessionUser = employee;
      this.cookieService.set('session_user', empId, 1);
      this.cookieService.set('session_name', `${employee.firstName} ${employee.lastName}`, 1);

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

      this.isLoading = false; // set the loading state to false

      this.router.navigate([returnUrl]);
    },
    error: (err) => {
      this.isLoading = false; // set the loading state to false

      if (err.error.message) {
        this.errorMessage = err.error.message;
        return;
      }

      this.errorMessage = err.error;
    }
  });
}
}
