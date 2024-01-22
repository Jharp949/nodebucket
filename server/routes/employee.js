"use strict";

const express = require('express');
const router = express.Router();
const { mongo } = require('../utils/mongo');

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
        const employee = await db.collection("employees").findOne({empId}); // findOne returns a single document
    
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

module.exports = router;