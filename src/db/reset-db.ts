import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

const client = neon(process.env.DATABASE_URL!);
const db = drizzle({ client });

async function resetDatabase() {
  console.log("🗑️ Resetting database...");
  const start = Date.now();

  try {
    // Drop all tables in the public schema
    const query = sql`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        -- Drop all tables
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
        
        -- Drop all enums
        FOR r IN (
          SELECT t.typname as enum_name 
          FROM pg_type t 
          JOIN pg_enum e ON t.oid = e.enumtypid 
          JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
          WHERE n.nspname = 'public'
        ) 
        LOOP
          EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.enum_name) || ' CASCADE';
        END LOOP;
        
        -- Drop all sequences
        FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') 
        LOOP
          EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequencename) || ' CASCADE';
        END LOOP;
      END $$;
    `;

    await db.execute(query);

    const end = Date.now();
    console.log(`✅ Database reset completed in ${end - start}ms`);
    console.log("🎯 All tables, enums, and sequences have been dropped");
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    throw error;
  }
}

resetDatabase()
  .then(() => {
    console.log("🎉 Reset script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Reset script error:", error);
    process.exit(1);
  });
