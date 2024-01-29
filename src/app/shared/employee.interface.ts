//Name: James Harper
//File: employee.interface.ts
//Date: 01/28/2024
//Description: Employee interface

import { Item } from './item.interface';
export interface Employee {
  empId: number;
  todo: Item[];
  done: Item[];
}