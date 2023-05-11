DROP TABLE IF EXISTS movies ;
CREATE TABLE IF NOT EXISTS movies(
    id SERIAL PRIMARY KEY,
    title varchar(8000),
    release_date varchar(255),
    imeg_path varchar(8000),
    overview varchar(8000)
);