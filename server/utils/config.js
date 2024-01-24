"use strict";

const db = {
    username: "nodebucket_user",
    password: "s3cret",
    name: "nodebucket"
};

const config = {
    port: 3000,
    dbUrl: `mongodb+srv://${db.username}:${db.password}@cluster0.eu9wggb.mongodb.net/${db.name}?retryWrites=true&w=majority`,
    dbName: db.name
};

module.exports = config;