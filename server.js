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
const saltRounds = 8;
var salt = bcrypt.genSaltSync(saltRounds);

// build routes
var app = express();
app
    .use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded())
    .use(session({
        key: 'user_sid',
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        username: ''
    }))
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
                req.session.username = req.body.username;
                res.json({ message: "success" }); // compare plaintext POST password to hashed DB password
            } else {
                res.json({ message: "failure" }); // failed to authenticate
            }
        });
    })
    .get('/api/user', isAuthed, function(req, res) {
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
    .get('/api/blog_post', isAuthed, function(req, res) {
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
    .get('/api/blog_post/:id', isAuthed, function(req, res) {
        const stmt = {
            name: 'fetch-blog-by-id',
            text: 'SELECT * FROM blog_post WHERE post_id=$1',
            values: [req.params.id]
        };
        // get a blog post by its ID
        pool.query(stmt, function(err, result) {
            if (err) {
                res.send(500);
                return console.error('error running query', err);
            }
            res.json(result.rows[0]);
        });
    })
    .put('/api/blog_post/:id', isAuthed, function(req, res) {
        const stmt1 = {
            name: 'update-blog-post',
            text: 'UPDATE blog_post SET title=$1, content=$2 WHERE post_id=$3 AND author=$4',
            values: [
                req.body.title,
                req.body.content,
                req.params.id,
                req.session.username
            ]
        };
        // get a blog post by its ID
        pool.query(stmt1, function(err, result) {
            if (err) {
                res.send(403);
                return console.error('error running query for update', err);
            }
            res.json(result.rows);
        });
    })
    .get('/api/blog_post/author/:author', isAuthed, function(req, res) {
        const stmt = {
            name: 'fetch-blogs-by-author',
            text: 'SELECT * FROM blog_post JOIN blog_user ON blog_user.username=$1',
            values: [req.params.author]
        };
        // get blog posts by the author
        pool.query(stmt, function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.json(result.rows);
        });
    })
    .get('/api/profile/blog_post/', isAuthed, function(req, res) {
        const stmt = {
            name: 'fetch-blogs-for-profile',
            text: 'SELECT * FROM blog_post JOIN blog_user ON blog_user.username=$1 WHERE blog_post.author=$1',
            values: [req.session.username]
        };
        // get blog posts by the author
        pool.query(stmt, function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.json(result.rows);
        });
    })
    .post('/api/blog_post', isAuthed, function(req, res) {
        const stmt = {
            name: 'insert-new-blog-post',
            text: 'INSERT INTO blog_post (content, title, author) VALUES ($1,$2,$3)',
            values: [req.body.content, req.body.title, req.session.username]
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
    .get('/api/comments/blog_post/:blog_post_id', isAuthed, function(req, res) {
        const stmt = {
            name: 'get-blog-post-by-id',
            text: 'SELECT * FROM blog_comment WHERE blog_post=$1',
            values: [req.params.blog_post_id]
        };
        // get blog posts by the author
        pool.query(stmt, function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.json(result.rows);
        });
    })
    .post('/api/comments/blog_post/:blog_post_id', isAuthed, function(req, res) {
        const stmt = {
            name: 'insert-new-comment-on-blog',
            text: 'INSERT INTO blog_comment (content, author, blog_post) VALUES ($1, $2, $3)',
            values: [req.body.content, req.session.username, req.body.postId]
        };
        // post a comment to a specific blog
        pool.query(stmt, function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.json({
                content: req.body.content,
                username: req.session.username,
                postId: req.body.postId
            });
        });
    })
    .post('/api/new_user', function(req, res) {
        console.log('route `/api/new_user` was hit');
        const stmt = {
            name: 'insert-new-user',
            text: 'INSERT INTO blog_user (username, password, name_first, name_last) VALUES ($1, $2, $3, $4)',
            values: [
                req.body.username,
                bcrypt.hashSync(req.body.password, salt),
                req.body.name_first,
                req.body.name_last
            ]
        };
        // insert the new user
        pool.query(stmt, function(err, result) {
            if (err) {
                res.send(500);
                return console.error('error creating new user', err);
            }
            res.json({});
        });
    })
    // client side stuff
    // no auth middleware required
    .get('/login', function(req, res) {
        res.render('pages/login');
    })
    .get('/logout', function(req, res) {
        req.session.destroy(function(err) {
            if (err) {
                return console.error('error logging out', err);
            } else {
                res.redirect('/login');
            }
        });
    })
    // the restof these routes require auth middleware
    .get('/blog_post/:id', isAuthed, function(req, res) {
        // get a specific blog post by its ID
        res.render('pages/blog_post', {
            postId: req.params.id,
        });
    })
    .get('/', isAuthed, function(req, res) {
        res.render('pages/index');
    })
    .get('/compose', isAuthed, function(req, res) {
        res.render('pages/compose');
    })
    .get('/compose/:id', isAuthed, function(req, res) {
        res.render('pages/compose_update');
    })
    .get('/profile', isAuthed, function(req, res) {
        res.json({ "message": "there ain't nothin' here yet fool" });
    })
    .get('/profile/posts', isAuthed, function(req, res) {
        res.render('pages/profile_posts', {
            username: req.session.username
        });
    })
    .get('/new_user', function(req, res) {
        res.render('pages/new_user');
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

// middleware
function isAuthed(req, res, next) {
    if (req.session && req.session.username != undefined) {
        return next();
    }
    res.redirect('/login');
}

function destroySession(req, res, next) {
    req.session.destroy();
}