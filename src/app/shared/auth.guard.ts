import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = (route, state) => {
  const cookie = inject(CookieService); // injects the cookie service

  if (cookie.get('session_user')) {
    console.log('User is logged in and can access the Task page');
    return true;
  } else {
    console.log('User is not logged in and cannot access the Task page');
    const router = inject(Router); // injects the router
    router.navigate(['/security/signin'], { queryParams:  {returnUrl: state.url }}); // navigates the user to the signin page
    return false;
  }
};
