CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
    skill_id text PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,  
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_skills (   
    user_id VARCHAR(50),
    skill_id VARCHAR(50),
    rating INTEGER,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);

CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id VARCHAR(50),
    receiver_id VARCHAR(50),
    skill_id VARCHAR(50),
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    FOREIGN KEY (requester_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id),
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);
CREATE TABLE IF NOT EXISTS newrequest (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id VARCHAR(50),
    receiver_id VARCHAR(50),
    receiver_skill_id VARCHAR(50),
    user_skill_id VARCHAR(50),
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    FOREIGN KEY (requester_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_skill_id) REFERENCES skills(skill_id),
    FOREIGN KEY (user_skill_id) REFERENCES skills(skill_id)
);

