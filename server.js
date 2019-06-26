const { Pool } = require('pg');
require('dotenv').config();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: connectionString });
const express = require('express');
const PORT = process.env.PORT || 5000;
const path = require('path');

express()
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/api/user', function(req, res) {
        pool.query('SELECT * FROM blog_user', function(err, result) {
            if (err)
                return console.error('error running query', err);
            res.json(result.rows);
        });
    })
    .get('/api/blog_post', function(req, res) {
        pool.query('SELECT * FROM blog_post', function(err, result) {
            if (err)
                return console.error('error running query', err);
            res.json(result.rows);
        });
    })
    .get('/', function(req, res) {
        res.render('pages/index');
    })
    .get('/compose', function(req, res) {
        res.json({ "message": "there ain't nothin' here yet fool" });
    })
    .get('/profile', function(req, res) {
        res.json({ "message": "there ain't nothin' here yet fool" });
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));