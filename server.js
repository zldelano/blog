const { Pool } = require('pg');
require('dotenv').config();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: connectionString });
const express = require('express');
var router = express.Router();

var exampleQuery = "SELECT * FROM blog_user";

pool.query(exampleQuery, function(err, result) {
    // If an error occurred...
    if (err) {
        console.log("Erorr in query: ");
        console.log(err);
    }

    // Log this to the console for debugging purposes
    console.log("Back from DB with result:");
    console.log(result.rows);
});

router.get('/users', function(req, res, next) {
    pool.connect(connectionString, function(err, client, done) {
        if (err)
            return console.error('error fetching client from pool', err);
        console.log("connected to database");
        client.query('SELECT * FROM blog_user', function(err, result) {
            done();
            if (err)
                return console.error('error running query', err);
            res.send(result);
        });
    });
});