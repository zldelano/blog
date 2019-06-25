-- Setup extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist
DROP TABLE IF EXISTS blog_user CASCADE;

CREATE TABLE blog_user (
   username VARCHAR(20) NOT NULL,
   name_first VARCHAR(30) NOT NULL,
   name_last  VARCHAR(30) NOT NULL,

   -- keys
   PRIMARY KEY (username),

   -- constraints
   CONSTRAINT username_length CHECK (CHAR_LENGTH(username) > 4)
);

-- Insert statements
INSERT INTO blog_user
   (username, name_first, name_last)
VALUES
   ('zdelano', 'Zach', 'Delano');