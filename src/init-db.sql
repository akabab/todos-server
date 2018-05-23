-- You must create a database
-- CREATE DATABASE <DB_NAME>;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(64),
  email VARCHAR(254),
  password VARCHAR(254),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=INNODB;

CREATE TABLE todos (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(128),
  description TEXT,
  image TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE=INNODB;

CREATE TABLE stars (
  userId INT NOT NULL,
  todoId INT NOT NULL,
  PRIMARY KEY (userId, todoId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (todoId) REFERENCES todos(id) ON DELETE CASCADE
) ENGINE=INNODB;
