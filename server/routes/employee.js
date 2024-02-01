"use strict";

const express = require('express');
const router = express.Router();
const { mongo } = require('../utils/mongo');
const Ajv = require('ajv');
const { ObjectId } = require('mongodb');

const ajv = new Ajv();

// tasks for employee document in the employee collection
const taskSchema = {
    type: 'object',
    properties: {
        text: { type: 'string' }
    },
    required: ['text'],
    additionalProperties: false
};

// tasks schema for validation

const tasksSchema = {
    type: 'object',
    required: ['todo', 'done'],
    additionalProperties: false,
    properties: {
        todo: { 
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    text: { type:'string' }
                },
                required: ['_id', 'text'],
                additionalProperties: false
            }
        },
        done: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    _id: { type:'string' },
                    text: { type:'string' }
                },
                required: ['_id', 'text'],
                additionalProperties: false
            }
        }
    }
}        

/**
* findEmployeeById
* @swagger
* /api/employees/{empId}:
*   get:
*     tags:
*       - Employees
*     description: Finds Employee by the ID number
*     summary: findEmployeeById
*     parameters:
*       - name: empId
*         in: path
*         required: true
*         description: Employee ID document
*         schema:
*           type: number
*     responses:
*       '200':
*         description: Employee by empId
*       '400':
*         description: Employee ID must be a number
*       '404':
*         description: Employee ID not found
*/
router.get('/:empId', (req, res, next) => {
    try {
        let { empId } = req.params;
        empId = parseInt(empId, 10);

        if (isNaN(empId)) {
            const err = new Error('Employee ID must be a number');
            err.status = 400;
            console.log('err', err);
            next(err);
            return; // exit out of the if statement
        }

    mongo(async db => {
        const employee = await db.collection('employees').findOne({empId}); // findOne returns a single document
    
        if (!employee) {
            const err = new Error('Unable to find employee with empId ' + empId);
            err.status = 404;
            console.log('err', err);
            next(err);
            return; // exit out of the if statement
        }

        res.send(employee); // send the employee back to the client
    });
    
} catch (err) {
    console.error('Error: ', err);
    next(err);
    }
});

// find all tasks by employee ID
/**
 * @swagger
 * /api/employees/{empId}/tasks:
 *   get:
 *     summary: Finds all tasks with employee ID
 *     description: Retrieves tasks with employee ID
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with the employee data.
 *       '400':
 *         description: Bad request.
 *       '404':
 *         description: Task not found.
 *       '500':
 *         description: Internal server error.
 */
router.get('/:empId/tasks', (req, res, next) => {
    try {
      let { empId } = req.params;
      empId = parseInt(empId, 10); //parse the empId to an integer
  
      if (isNaN(empId)) {
        const err = new Error('input must be a number');
        err.status = 400;
        console.error("err", err);
        next(err);
        return;
      }
  
      mongo(async db => {
        //pulling task for employee
        const tasks = await db.collection('employees').findOne(
          { empId },
          { projection: { empId: 1, todo: 1, done: 1}}
        )
  
        console.log('tasks', tasks);
  
        //checks to see if error
        if (!tasks) {
          const err = new Error('Unable to find task with empId ' + empId);
          err.status = 404;
          console.error("err", err);
          next(err);
          return;
        }
        //if no error sends tasks
        res.send(tasks);
  
      }, next)
  
    } catch (err) {
      console.error("err", err);
      next(err);
    }
  })

// create task API
// string: task
// int: empId
// http method: post
// url: http://localhost:3000/api/employees/1/tasks

// 1. validation
    // check if empId is a number
    // 400 status code
// 2. task,
    // 400 status code
// 3. Query the database for the employee record
// 4. If the FormRecord is not found
    // 404 status code
// 5. If the employee record is found
    // Create the task
// Successfull
    // 201 status code
    // return the task

/**
 * @swagger
 * /api/employees/{empId}/tasks:
 *   post:
 *     summary: Creates a task for employee
 *     description: Create a task for employee ID.
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Task created.
 *       '400':
 *         description: Bad request.
 *       '404':
 *         description: Task not found.
 *       '500':
 *         description: Internal server error.
 */

router.post('/:empId/tasks', (req, res, next) => {
   try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // empId validation
    if (isNaN(empId)) {
        const err = new Error('Employee ID must be a number');
        err.status = 400;
        console.log('err', err);
        next(err);
        return; // exit out of the if statement
    }

    const { text } = req.body;
    const validator = ajv.compile(taskSchema);
    const isValid = validator({ text });

    if (!isValid) {
        const err = new Error('Bad request');
        err.status = 400;
        err.errors = validator.errors;
        console.error("err", err);
        next(err);
        return;
    }

    mongo(async db => {
        const employee = await db.collection('employees').findOne({ empId });

        if (!employee) {
            const err = new Error('Unable to find employee with empId ' + empId);
            err.status = 404;
            console.log('err', err);
            next(err);
            return; // exit out of the if statement
        }

        const task = {
            _id: new ObjectId(),
            text
        }

        const result = await db.collection('employees').updateOne(
            { empId },
            { $push: { todo: task } }
        );

        if (!result.modifiedCount) {
            const err = new Error('Unable to create task for empId ' + empId);
            err.status = 500;
            console.log('err', err);
            next(err);
            return; // exit out of the if statement
        }

        res.status(201).send({ id: task._id })
   }, next)

   } catch (err) {
         console.error('err: ', err);
         next(err);
   }
});

router.put('/:empId/tasks', (req, res, next) => {
    
    try {
        let { empId } = req.params;
        empId = parseInt(empId, 10);
        console.log('empId', empId);

        if (isNaN(empId)) {
            const err = new Error('Input must be a number');
            err.status = 400;
            console.log('err', err);
            next(err);
            return; // exit out of the if statement
        }

        const validator = ajv.compile(tasksSchema);
        const isValid = validator(req.body);

        if (!isValid) {
            const err = new Error('Bad request');
            err.status = 400;
            err.errors = validator.errors;
            console.log('err', err);
            next(err);
            return;
        }

        mongo(async db => {
            const employee = await db.collection('employees').findOne({ empId });
            if (!employee) {
                const err = new Error('Unable to find employee with empId'+ empId);
                err.status = 404;
                console.log('err', err);
                next(err);
                return; // exit out of the if statement
            }

            const result = await db.collection('employees').updateOne(
                { empId },
                { $set: { todo: req.body.todo, done: req.body.done } }
            );

            if (!result.modifiedCount) {
                const err = new Error('Unable to update employee with empId' + empId);
                err.status = 500;
                console.log('err', err);
                next(err);
                return; // exit out of the if statement
            }

            res.status(204).send();

        }, next);

    } catch (err) {
        console.error('err: ', err);
        next(err);

    }
});

router.delete('/:empId/tasks/:taskId', (req, res, next) => {
    try {
        let { empId, taskId } = req.params;
        empId = parseInt(empId, 10);

        if (isNaN(empId)) {
            const err = new Error('Employee ID must be a number');
            err.status = 400;
            console.log('err', err);
            next(err);
            return; // exit out of the if statement
        }

        mongo(async db => {
            let employee = await db.collection('employees').findOne({ empId });

            if (!employee) {
                const err = new Error('Unable to find employee with empId ' + empId);
                err.status = 404;
                console.log('err', err);
                next(err);
                return; // exit out of the if statement
            }

            if (!employee.todo) employee.todo = []; // if the employee does not have a todo array, create one
            if (!employee.done) employee.done = []; // if the employee does not have a done array, create one

            const todo = employee.todo.filter(task => task._id.toString() !== taskId.toString());
            const done = employee.done.filter(task => task._id.toString() !== taskId.toString());
            
            // update the employee record with the new todo and done arrays
            const result = await db.collection('employees').updateOne(
                { empId },
                { $set: { todo: todo, done: done } }
            )

            res.status(204).send();

        }, next);

    } catch (err) {
        console.error('err: ', err);
        next(err);
    }
});

module.exports = router;