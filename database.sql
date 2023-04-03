DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "exercises" CASCADE;
DROP TABLE IF EXISTS "tautologies" CASCADE;
DROP TABLE IF EXISTS "reasonings" CASCADE;
DROP TABLE IF EXISTS "usr_exc" CASCADE;
DROP TABLE IF EXISTS "usr_ttl" CASCADE;
DROP TABLE IF EXISTS "usr_rsn" CASCADE;

CREATE TABLE IF NOT EXISTS "users" (
	"id_usr" INTEGER NOT NULL,
	"username" TEXT NOT NULL,
    "passwd" TEXT NOT NULL,
    "email" TEXT NOT NULL,
	CONSTRAINT "users_pk" PRIMARY KEY ("id_usr")
);

CREATE TABLE IF NOT EXISTS "exercises" (
	"id_exc" INTEGER NOT NULL,
	"name_exc" TEXT NOT NULL,
	CONSTRAINT "exercices_pk" PRIMARY KEY ("id_exc")
);

CREATE TABLE IF NOT EXISTS "tautologies" (
	"id_ttl" INTEGER NOT NULL,
	"name_ttl" TEXT NOT NULL,
	CONSTRAINT "tautologies_pk" PRIMARY KEY ("id_ttl")
);

CREATE TABLE IF NOT EXISTS "reasonings" (
	"id_rsn" INTEGER NOT NULL,
	"name_rsn" TEXT NOT NULL,
	CONSTRAINT "reasonings_pk" PRIMARY KEY ("id_rsn")
);

CREATE TABLE IF NOT EXISTS "usr_exc" (
	"id_usr" INTEGER NOT NULL,
	"id_exc" INTEGER NOT NULL,
	"bool_usr_exc" BOOLEAN NOT NULL,
	CONSTRAINT "usr_exc_pk" PRIMARY KEY ("id_usr","id_exc"),
    CONSTRAINT "usr_exc_fk0" FOREIGN KEY ("id_usr") REFERENCES "users"("id_usr"),
    CONSTRAINT "usr_exc_fk1" FOREIGN KEY ("id_exc") REFERENCES "exercises"("id_exc")
);

CREATE TABLE IF NOT EXISTS "usr_ttl" (
	"id_usr" INTEGER NOT NULL,
	"id_ttl" INTEGER NOT NULL,
	"bool_usr_ttl" BOOLEAN NOT NULL,
	CONSTRAINT "usr_ttl_pk" PRIMARY KEY ("id_usr","id_ttl"),
    CONSTRAINT "usr_ttl_fk0" FOREIGN KEY ("id_usr") REFERENCES "users"("id_usr"),
    CONSTRAINT "usr_ttl_fk1" FOREIGN KEY ("id_ttl") REFERENCES "tautologies"("id_ttl")
);

CREATE TABLE IF NOT EXISTS "usr_rsn" (
	"id_usr" INTEGER NOT NULL,
	"id_rsn" INTEGER NOT NULL,
	"bool_usr_rsn" BOOLEAN NOT NULL,
	CONSTRAINT "usr_rsn_pk" PRIMARY KEY ("id_usr","id_rsn"),
    CONSTRAINT "usr_rsn_fk0" FOREIGN KEY ("id_usr") REFERENCES "users"("id_usr"),
    CONSTRAINT "usr_rsn_fk1" FOREIGN KEY ("id_rsn") REFERENCES "reasonings"("id_rsn")
);

