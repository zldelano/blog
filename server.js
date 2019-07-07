const { Pool } = require('pg');
require('dotenv').config();
const $ = require('jquery');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: connectionString });
const express = require('express');
const PORT = process.env.PORT || 5000;
const path = require('path');
const bodyParser = require('body-parser');
const USER_ID = 'zdelano';

express()
    .use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded())
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    // stuff we get from our API
    .get('/api/user', function(req, res) {
        pool.query('SELECT * FROM blog_user', function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.json(result.rows);
        });
    })
    .get('/api/blog_post', function(req, res) {
        pool.query('SELECT * FROM blog_post', function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.json(result.rows);
        });
    })
    .get('/api/blog_post/:id', function(req, res) {
        //   get a blog post by its ID
        pool.query('SELECT * FROM blog_post WHERE post_id=\'' + req.params.id + '\'', function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.json(result.rows[0]);
        });
    })
    .get('/api/blog_post/author/:author', function(req, res) {
        // get blog posts by the author
        pool.query('SELECT * FROM blog_post JOIN blog_user ON blog_user.username=blog_post.author ' +
            'WHERE blog_post.author=' + USER_ID,
            function(err, result) {
                if (err) {
                    return console.error('error running query', err);
                }
                res.json(result.rows);
            });
    })
    .get('/api/comments/blog_post/:blog_post_id', function(req, res) {
        // get blog posts by the author
        pool.query('SELECT * FROM blog_comment WHERE blog_post=\'' + req.params.blog_post_id + '\'',
            function(err, result) {
                if (err) {
                    return console.error('error running query', err);
                }
                res.json(result.rows);
            });
    })
    .post('/api/comments/blog_post/:blog_post_id', function(req, res) {

        pool.query('INSERT INTO blog_comment (content, author, blog_post) VALUES (\'' +
            req.body.content + '\', \'' + USER_ID + '\', \'' + req.body.postId + '\')',
            function(err, result) {
                if (err) {
                    return console.error('error running query', err);
                }
                res.json(result.rows);
            });
    })
    // client side stuff
    .get('/blog_post/:id', function(req, res) {
        // get a specific blog post by its ID
        res.render('pages/blog_post', {
            postId: req.params.id,
        });
    })
    .get('/', function(req, res) {
        res.render('pages/index');
    })
    .get('/compose', function(req, res) {
        res.render('pages/compose');
    })
    .post('/compose', function(req, res) {
        pool.query('INSERT INTO blog_post (content, title, author)' +
            'VALUES (\'' + req.body.formComposeContent + '\', \'' +
            req.body.formComposeTitle + '\', \'' + USER_ID + '\')',
            function(err, result) {
                if (err) {
                    res.render('pages/error');
                    return console.error('error running query', err);
                }
            });
        res.render('pages/compose_post');
    })
    .get('/profile', function(req, res) {
        res.json({ "message": "there ain't nothin' here yet fool" });
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));