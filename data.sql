DROP TABLE IF EXISTS data_carte CASCADE;


CREATE TABLE data_carte(
    id_data int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    un_text text
);


INSERT INTO data_carte (un_text) VALUES ('Bonjours de la base de données :)');