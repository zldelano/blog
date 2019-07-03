const { Pool } = require('pg');
require('dotenv').config();
const $ = require('jquery');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: connectionString });
const express = require('express');
const PORT = process.env.PORT || 5000;
const path = require('path');

express()
    .use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))
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
    .get('/api/blog_post/:id', function(req, res) {
        //   get a blog post by its ID
        pool.query('SELECT * FROM blog_post WHERE post_id=' + req.params.id, function(err, result) {
            if (err)
                return console.error('error running query', err);
            res.json(result.rows[0]);
        });
    })
    .get('/', function(req, res) {
        res.render('pages/index');
    })
    .get('/compose', function(req, res) {
        res.render('pages/compose');
    })
    .get('/profile', function(req, res) {
        res.json({ "message": "there ain't nothin' here yet fool" });
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));