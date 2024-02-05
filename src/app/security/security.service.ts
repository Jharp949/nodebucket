/**
 * Title: security.service.ts
 * Author: James Harper
 * Date: 1/31/24
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor(private http: HttpClient) { }

  findEmployeeById(empId: number) {
    return this.http.get('/api/employees/' + empId); // retunrns the employee object
  }
}
