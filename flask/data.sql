DROP TABLE IF EXISTS data CASCADE;


CREATE TABLE data(
    matiere text PRIMARY KEY,
    note int
);


INSERT INTO data (matiere,note) VALUES ('maths',18),('français',5),('histoire',10),('physique',15),('svt',12),('phylo',6),('sport',14);