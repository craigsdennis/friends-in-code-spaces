-- Migration number: 0004 	 2024-04-30T18:26:47.270Z
CREATE TABLE interview_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interview_id INTEGER,
    topic TEXT NOT NULL,
    question TEXT NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (interview_id) REFERENCES interviews(id)
);