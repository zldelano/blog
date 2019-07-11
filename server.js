// require statements
const { Pool } = require('pg');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

// some setup
require('dotenv').config();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: connectionString });
const PORT = process.env.PORT || 5000;
const USER_ID = 'zdelano';
const saltRounds = 8;
var salt = bcrypt.genSaltSync(saltRounds);

// build routes
express()
    .use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded())
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    // stuff we get from our API
    .post('/api/authenticate', function(req, res) {
        const stmt = {
            name: "fetch-user",
            text: 'SELECT * FROM blog_user WHERE username=$1',
            values: [req.body.username]
        };
        // get the user
        pool.query(stmt, function(err, result) {
            if (err) {
                res.send(403);
                return console.error('err running query', err);
            }
            // var hash = bcrypt.hashSync(req.body.password, salt);
            if (result.rows.length == 0) {
                res.send(403); // no matching username? not allowed
            } else if (result.rows.length > 1) {
                res.send(500); // if we got more than 1 row, we should check our schema! 
            } else if (bcrypt.compareSync(req.body.password, result.rows[0].password)) {
                res.json({ message: "success" }); // compare plaintext POST password to hashed DB password
            } else {
                res.json({ message: "failure" }); // failed to authenticate
            }
        });
    })
    .get('/api/user', function(req, res) {
        const stmt = {
            name: 'fetch-user',
            text: 'SELECT * FROM blog_user'
        };
        // get a user
        pool.query(stmt, function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.json(result.rows);
        });
    })
    .get('/api/blog_post', function(req, res) {
        const stmt = {
            name: 'fetch-blogs',
            text: 'SELECT * FROM blog_post'
        };

        pool.query(stmt, function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.json(result.rows);
        });
    })
    .get('/api/blog_post/:id', function(req, res) {
        const stmt = {
            name: 'fetch-blog-by-id',
            text: 'SELECT * FROM blog_post WHERE post_id=$1',
            values: [req.params.id]
        };
        // get a blog post by its ID
        pool.query(stmt, function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.json(result.rows[0]);
        });
    })
    .get('/api/blog_post/author/:author', function(req, res) {
        const stmt = {
            name: 'fetch-blogs-by-author',
            text: 'SELECT * FROM blog_post JOIN blog_user ON blog_user.username=$1',
            values: [USER_ID]
        };
        // get blog posts by the author
        pool.query(stmt, function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.json(result.rows);
        });
    })
    .post('/api/blog_post', function(req, res) {
        const stmt = {
            name: 'insert-new-blog-post',
            text: 'INSERT INTO blog_post (content, title, author) VALUES ($1,$2,$3)',
            values: [req.body.content, req.body.title, USER_ID]
        };
        // make a new blog post
        pool.query(stmt, function(err, result) {
            if (err) {
                res.json({ message: "error" });
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
    .get('/login', function(req, res) {
        res.render('pages/login');
    })
    .get('/compose', function(req, res) {
        res.render('pages/compose');
    })
    .get('/profile', function(req, res) {
        res.json({ "message": "there ain't nothin' here yet fool" });
    })
    .get('/profile/posts', function(req, res) {
        res.render('pages/profile_posts', {
            username: USER_ID
        });
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));