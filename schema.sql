DROP TABLE IF EXISTS savedbooks;

CREATE TABLE savedbooks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    authors VARCHAR(255),
    thumbnail_url TEXT,
    description TEXT
);
