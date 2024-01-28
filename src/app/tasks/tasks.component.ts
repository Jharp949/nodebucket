import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TaskService } from '../shared/task.service';
import { Employee } from '../shared/employee.interface';
import { Item } from '../shared/item.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})

export class TasksComponent {
  employee: Employee;
  empId: number;
  todo: Item[];
  done: Item[];
  errorMessage: string;
  successMessage: string;

  newTaskForm: FormGroup = this.fb.group({
    text: [null, Validators.compose ([ Validators.required, Validators.minLength(3), Validators.maxLength(50)])]
  });

  constructor(private cookieService: CookieService, private taskService: TaskService, private fb: FormBuilder) {
    this.employee = {} as Employee;
    this.todo = [];
    this.done = [];
    this.errorMessage = '';
    this.successMessage = '';

    this.empId = parseInt(this.cookieService.get('session_user'), 10);

    this.taskService.getTasks(this.empId).subscribe({
      next: (res: any) => {
        console.log('Employee: ', res);
        this.employee = res;
      },
      error: (err) => {
        console.error('error: ', err);
        this.errorMessage = err.message;
        this.hideAlert();
      },
  complete: () => {
    this.employee.todo ? this.todo = this.employee.todo : this.todo = [];
    this.employee.done ? this.done = this.employee.done : this.done = [];

    console.log('todo', this.todo);
    console.log('done', this.done);
  }
})
}

addTask() {
  const text = this.newTaskForm.controls['text'].value;
  
  this.taskService.addTask(this.empId, text).subscribe({
    next: (task: any) => {
      console.log('Task added with id', task.id);
      const newTask = {
        _id: task.id,
        text: text
      }

      this.todo.push(newTask);
      this.newTaskForm.reset();

      this.successMessage = 'Task added successfully';

      this.hideAlert();
    },
    error: (err) => {
      console.error('error: ', err);
      this.errorMessage = err.message;
      this.hideAlert();
    }
  });
}

hideAlert() {
  setTimeout(() => {
    this.errorMessage = '';
    this.successMessage = '';
  }, 5000);
}
}