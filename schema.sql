
CREATE TABLE savedbooks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    authors VARCHAR(50),
    thumbnail_url VARCHAR(150),
    description VARCHAR(255)
)
