import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TaskService } from '../shared/task.service';
import { Employee } from '../shared/employee.interface';
import { Item } from '../shared/item.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

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

deleteTask(taskId: string) {
  console.log(`Task item: ${taskId}`)

  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  this.taskService.deleteTask(this.empId, taskId).subscribe({
    next: (res: any) => {
      console.log('Task deleted with ID: ', taskId);

      if (!this.todo) this.todo = []
      if (!this.done) this.done = []

      this.todo = this.todo.filter(t => t._id.toString() !== taskId);
      this.done = this.done.filter(t => t._id.toString() !== taskId);
      
      this.successMessage = 'Task deleted successfully';

      this.hideAlert();
    },
    error: (err) => {
      console.error('error: ', err);
      this.errorMessage = err.message;
      this.hideAlert();
    }
  });
}

drop(event: CdkDragDrop<any[]>) {
  if (event.previousContainer === event.container) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  
    console.log('Moved item in array', event.container.data)
  
    this.updateTaskList (this.empId, this.todo, this.done);
  } else {
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
  
    console.log('Moved item to another array', event.container.data)
  
    this.updateTaskList (this.empId, this.todo, this.done);
  }
}

hideAlert() {
  setTimeout(() => {
    this.errorMessage = '';
    this.successMessage = '';
  }, 5000);
}

/*
* @description updateTaskList function to update a task for an employee by employeeId
* @param empID
* @param todo
* @param done
* @returns void
*/

updateTaskList(empId: number, todo: Item[], done: Item[]) {
  this.taskService.updateTask(empId, todo, done).subscribe({
    next: (res: any) => {
      console.log('Task updated successfully')
    },
    error: (err) => {
      console.log('error', err) //log the error message to the console
      this.errorMessage = err.message //set the error message
      this.hideAlert() //call the hideAlert() function
    }
  })
}
}
