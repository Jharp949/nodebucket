"use strict";

const { MongoClient } = require("mongodb");

const MONGO_URL = "mongodb+srv://nodebucket_user:s3cret@cluster0.eu9wggb.mongodb.net/?retryWrites=true&w=majority"//mongodb link;

const mongo = async(operations, next) => {
    try {
        console.log("Connecting to MongoDB...");
        const client = await MongoClient.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const db = client.db("nodebucket");
        console.log("Connected to MongoDB!");

        await operations(db);
        console.log("Operation completed successfully!");

        client.close();
        console.log("Disconnected from MongoDB!");
    } catch (err) {
        const error = new Error("Error connecting to db: " + err);
        error.status = 500;

        console.log("Error connecting to db: " + err);
        next(error);
    }
};

module.exports = { mongo };