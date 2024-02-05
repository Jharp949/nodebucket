import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from './item.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }

  //Get all tasks for a specific employee
  getTasks(empID: number){
    return this.http.get('/api/employees/' + empID + '/tasks')
  }

  // Add a new task to a specific employee
  addTask(empID: number, text: string){
    return this.http.post('/api/employees/' + empID + '/tasks', { text })
  }

  /* @description deleteTask function to delete a task for an employee by employeeId and taskId
  *  @param empID
  *  @param taskId
  *  @returns - status code 204 (no content)
  */

  deleteTask(empID: number, taskId: string){
    return this.http.delete('/api/employees/' + empID + '/tasks/' + taskId)
  }

  /* @description updateTask function to update a task for an employee by employeeId
  *  @param empID - employeeId
  *  @param todo - list of tasks to do
  *  @param done - list of tasks done
  *  @returns - status code 204 (no content)
  */

  updateTask(empID: number, todo: Item[], done: Item[]){
    return this.http.put('/api/employees/' + empID + '/tasks', { todo, done })
  }

}