/**
 * Title: security-routing.module.ts
 * Author: James Harper
 * Date: 1/31/24
 */

// imports statements
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityComponent } from './security.component';
import { SigninComponent } from './signin/signin.component';

const routes: Routes = [
  {
    path: '',
    component: SecurityComponent,
    children : [
      {
        path: 'signin',
        component: SigninComponent,
        title: 'Nodebucket: Sign In'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
