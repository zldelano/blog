-- Setup extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist
DROP TABLE IF EXISTS blog_user CASCADE;
DROP TABLE IF EXISTS blog_post CASCADE;
DROP TABLE IF EXISTS blog_comment CASCADE;

CREATE TABLE blog_user (
   username VARCHAR(20) NOT NULL,
   name_first VARCHAR(30) NOT NULL,
   name_last  VARCHAR(30) NOT NULL,

   -- keys
   PRIMARY KEY (username),

   -- constraints
   CONSTRAINT username_length CHECK (CHAR_LENGTH(username) > 4)
);

CREATE TABLE blog_post (
   post_id UUID NOT NULL DEFAULT uuid_generate_v4(),
   content TEXT NOT NULL,
   title VARCHAR(80) NOT NULL,
   author VARCHAR(20) NOT NULL,
   -- created TIMESTAMP DEFAULT (you will want to put the current time)

   -- keys
   PRIMARY KEY (post_id),
   FOREIGN KEY (author) REFERENCES blog_user (username),

   -- constraints
   CONSTRAINT title_length CHECK (CHAR_LENGTH(title) > 0),
   CONSTRAINT post_length CHECK (CHAR_LENGTH(title) > 9)
);

CREATE TABLE blog_comment (
   comment_id UUID NOT NULL DEFAULT uuid_generate_v4(),
   content TEXT NOT NULL,
   author VARCHAR(20) NOT NULL,
   blog_post UUID NOT NULL,
   -- created TIMESTAMP DEFAULT (you will want to put the current time)

   -- keys
   PRIMARY KEY (comment_id),
   FOREIGN KEY (author) REFERENCES blog_user (username),
   FOREIGN KEY (blog_post) REFERENCES blog_post (post_id),

   -- constraints
   CONSTRAINT comment_length CHECK (CHAR_LENGTH(content) > 9)
);

-- Insert statements
INSERT INTO blog_user
   (username, name_first, name_last)
VALUES
   ('zdelano', 'Zach', 'Delano')
   ,('cknesnej', 'Charlotte', 'Jensen')
   ,('btskeem', 'Brianne', 'Skeem');

INSERT INTO blog_post
   (content, title, author)
VALUES
   ('This is the  content of Zach''s post.', 'Title, Example #1', 'zdelano')
   ,('Content example... testing.', 'Title, Example #2', 'cknesnej')
   ,('Oh well, whatever.', 'Title, Example #3', 'btskeem');


INSERT INTO blog_comment
   (blog_post, content, author)
VALUES
   (
      (SELECT post_id FROM blog_post WHERE author='zdelano' LIMIT 1)
      ,'This is a great article! Good work.'
      ,'cknesnej'
   );