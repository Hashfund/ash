CREATE TABLE IF NOT EXISTS "boundingCurve" (
	"id" text PRIMARY KEY NOT NULL,
	"mint" text NOT NULL,
	"initialPrice" text NOT NULL,
	"maximumMarketCap" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"signature" text NOT NULL,
	CONSTRAINT "boundingCurve_mint_unique" UNIQUE("mint")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mints" (
	"id" text PRIMARY KEY NOT NULL,
	"uri" text NOT NULL,
	"name" text NOT NULL,
	"ticker" text NOT NULL,
	"creator" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"reserve" text NOT NULL,
	"totalSupply" text NOT NULL,
	"signature" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "swap" (
	"id" serial PRIMARY KEY NOT NULL,
	"mint" text NOT NULL,
	"amountIn" text NOT NULL,
	"amountOut" text NOT NULL,
	"tradeDirection" integer NOT NULL,
	"marketCap" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"payer" text NOT NULL,
	"signature" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "boundingCurve" ADD CONSTRAINT "boundingCurve_mint_mints_id_fk" FOREIGN KEY ("mint") REFERENCES "public"."mints"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "swap" ADD CONSTRAINT "swap_mint_mints_id_fk" FOREIGN KEY ("mint") REFERENCES "public"."mints"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
