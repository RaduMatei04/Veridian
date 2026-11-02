CREATE TABLE "measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_id" integer NOT NULL,
	"measured_at" timestamp NOT NULL,
	"parameter" varchar(12) NOT NULL,
	"value" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sensor_daily" (
	"id" serial PRIMARY KEY NOT NULL,
	"sensor_id" integer NOT NULL,
	"station_id" integer NOT NULL,
	"day" date NOT NULL,
	"parameter" varchar(12) NOT NULL,
	"value" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sensors" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	CONSTRAINT "sensors_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"city" varchar(30) NOT NULL,
	"type" varchar(30) NOT NULL,
	"lat" double precision NOT NULL,
	"lon" double precision NOT NULL,
	CONSTRAINT "stations_city_unique" UNIQUE("city")
);
--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_daily" ADD CONSTRAINT "sensor_daily_sensor_id_sensors_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."sensors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_daily" ADD CONSTRAINT "sensor_daily_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "measurements_station_time_idx" ON "measurements" USING btree ("station_id","measured_at");--> statement-breakpoint
CREATE INDEX "sensor_daily_station_day_idx" ON "sensor_daily" USING btree ("station_id","day");--> statement-breakpoint
CREATE INDEX "sensor_daily_sensor_day_idx" ON "sensor_daily" USING btree ("sensor_id","day");