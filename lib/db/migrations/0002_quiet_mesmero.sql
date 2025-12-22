CREATE TYPE "public"."deload_type" AS ENUM('volume', 'intensity', 'full_rest');--> statement-breakpoint
CREATE TYPE "public"."fatigue_level" AS ENUM('fresh', 'normal', 'elevated', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "deload_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"duration_days" integer NOT NULL,
	"deload_type" "deload_type" NOT NULL,
	"volume_modifier" numeric(3, 2) DEFAULT '0.60',
	"intensity_modifier" numeric(3, 2) DEFAULT '1.00',
	"trigger_reason" varchar(100) NOT NULL,
	"fatigue_score_at_trigger" integer,
	"is_active" boolean DEFAULT true,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fatigue_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"fatigue_score" integer NOT NULL,
	"fatigue_level" "fatigue_level" NOT NULL,
	"rpe_creep_score" integer DEFAULT 0,
	"performance_score" integer DEFAULT 0,
	"recovery_debt_score" integer DEFAULT 0,
	"volume_load_score" integer DEFAULT 0,
	"streak_score" integer DEFAULT 0,
	"recommendations" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deload_periods" ADD CONSTRAINT "deload_periods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fatigue_logs" ADD CONSTRAINT "fatigue_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "deload_periods_user_active_idx" ON "deload_periods" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "fatigue_logs_user_date_idx" ON "fatigue_logs" USING btree ("user_id","date");