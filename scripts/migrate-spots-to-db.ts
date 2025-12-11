/**
 * Migration Script: Move hardcoded spots to Supabase database
 *
 * Run this script once after setting up the admin schema:
 * npx tsx scripts/migrate-spots-to-db.ts
 *
 * Prerequisites:
 * 1. Run supabase-admin-schema.sql in your Supabase SQL Editor
 * 2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 */

import { spots } from "../src/data/spots";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required");
  console.log("\nUsage:");
  console.log("NEXT_PUBLIC_SUPABASE_URL='...' SUPABASE_SERVICE_ROLE_KEY='...' npx tsx scripts/migrate-spots-to-db.ts");
  process.exit(1);
}

// Use service role key to bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function migrateSpots() {
  console.log("🚀 Starting spots migration...\n");

  let successCount = 0;
  let errorCount = 0;

  try {
    // Check if spots table exists and has data
    const { count, error: countError } = await supabase
      .from("spots")
      .select("*", { count: "exact", head: true });

    if (countError) {
      if (countError.message.includes("does not exist")) {
        console.error("❌ Spots table does not exist. Run supabase-admin-schema.sql first.");
        process.exit(1);
      }
      throw countError;
    }

    if (count && count > 0) {
      console.log(`⚠️  Spots table already has ${count} entries.`);
      console.log("Existing spots will be skipped (upsert mode).\n");
    }

    // Insert each spot
    for (const spot of spots) {
      const { error } = await supabase.from("spots").upsert(
        {
          id: spot.id,
          name: spot.name,
          city_id: spot.cityId,
          types: spot.types,
          description: spot.description,
          coordinates: spot.coordinates,
          vibes: spot.vibes,
          google_maps_url: spot.googleMapsUrl || null,
          luma_url: spot.lumaUrl || null,
          website_url: spot.websiteUrl || null,
          twitter_url: spot.twitterUrl || null,
          instagram_url: spot.instagramUrl || null,
          linkedin_url: spot.linkedinUrl || null,
          added_by: spot.addedBy,
          approved: spot.approved,
        },
        { onConflict: "id", ignoreDuplicates: true }
      );

      if (error) {
        errorCount++;
        console.error(`❌ Failed: ${spot.name} - ${error.message}`);
      } else {
        successCount++;
        console.log(`✅ Migrated: ${spot.name} (${spot.cityId})`);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Successfully migrated: ${successCount} spots`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} spots`);
    }
    console.log("=".repeat(50));

    // Show final count
    const { count: finalCount } = await supabase
      .from("spots")
      .select("*", { count: "exact", head: true });

    console.log(`\n📊 Total spots in database: ${finalCount}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Migration failed:", message);
    process.exit(1);
  }
}

migrateSpots();
