-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Members Table
CREATE TABLE project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  UNIQUE(project_id, user_id)
);

-- Tasks Table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);