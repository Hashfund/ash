CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"avatar" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mints" (
	"id" text PRIMARY KEY NOT NULL,
	"uri" text NOT NULL,
	"name" text NOT NULL,
	"ticker" text NOT NULL,
	"reserve" text NOT NULL,
	"signature" text NOT NULL,
	"total_supply" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"creator" text NOT NULL,
	"can_trade" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "swaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount_in" text NOT NULL,
	"amount_out" text NOT NULL,
	"market_cap" text NOT NULL,
	"signature" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"trade_direction" integer NOT NULL,
	"mint" text NOT NULL,
	"payer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "boundingCurve" (
	"id" text PRIMARY KEY NOT NULL,
	"signature" text NOT NULL,
	"tradable" boolean DEFAULT true,
	"timestamp" timestamp NOT NULL,
	"initial_price" text NOT NULL,
	"maximum_market_cap" text NOT NULL,
	"mint" text NOT NULL,
	CONSTRAINT "boundingCurve_mint_unique" UNIQUE("mint")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mints" ADD CONSTRAINT "mints_creator_users_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "swaps" ADD CONSTRAINT "swaps_mint_mints_id_fk" FOREIGN KEY ("mint") REFERENCES "public"."mints"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "swaps" ADD CONSTRAINT "swaps_payer_users_id_fk" FOREIGN KEY ("payer") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "boundingCurve" ADD CONSTRAINT "boundingCurve_mint_mints_id_fk" FOREIGN KEY ("mint") REFERENCES "public"."mints"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
