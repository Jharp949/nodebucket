"use strict";

const express = require('express');
const router = express.Router();
const { mongo } = require('../utils/mongo');
const Ajv = require('ajv');
const { ObjectId } = require('mongodb');

const ajv = new Ajv();

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
router.get('/:empId/tasks', (req, res, next) => {
    try{
        let { empId } = req.params;
        empId = parseInt(empId, 10); // ensure empId is a number

        if (isNaN(empId)) {
            const err = new Error('Employee ID must be a number');
            err.status = 400;
            console.log('err', err);
            next(err);
            return; // exit out of the if statement
        }

        mongo(async db => {
            const employee = await db.collection('employees').findOne(
                { empId },
                { projection: { empId: 0, todo: 1, done: 1 } }
            );
        }, next);

        console.log('employee: ', employee);

        if (!employee) {
            const err = new Error('Unable to find empId ' + empId);
            err.status = 404;
            console.log('err', err);
            next(err);
            return; // exit out of the if statement
        }

        res.send(employee); // send the tasks back to the client

    } catch (err) {
        console.error('err: ', err);
        next(err);
        }
});

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

const taskSchema = {
    type: 'object',
    properties: {
        text: { type: 'string' }
    },
    required: ['text'],
    additionalProperties: false
};

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

module.exports = router;