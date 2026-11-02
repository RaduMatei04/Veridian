CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(30) NOT NULL,
	"password_hash" text NOT NULL,
	"theme" varchar(10) DEFAULT 'light' NOT NULL,
	"accent" varchar(10) DEFAULT 'blue' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
