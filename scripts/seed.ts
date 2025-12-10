import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { spots as spotsTable, users, upvotes, reviews } from "../src/lib/schema";
import { spots as spotsData } from "../src/data/spots";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

async function seed() {
  console.log("Starting seed...\n");

  // Track unique users from upvoters and reviews
  const usersToCreate = new Map<string, {
    id: string;
    handle: string;
    displayName?: string;
    avatarUrl?: string;
    provider: string;
  }>();

  // Collect all unique users from spot data
  for (const spot of spotsData) {
    // Add upvoters
    if (spot.upvoters) {
      for (const upvoter of spot.upvoters) {
        if (!usersToCreate.has(upvoter.handle)) {
          usersToCreate.set(upvoter.handle, {
            id: `seed_${upvoter.handle}`,
            handle: upvoter.handle,
            displayName: upvoter.displayName,
            avatarUrl: upvoter.avatarUrl,
            provider: upvoter.provider || "x",
          });
        }
      }
    }

    // Add review authors
    if (spot.reviews) {
      for (const review of spot.reviews) {
        if (!usersToCreate.has(review.authorHandle)) {
          usersToCreate.set(review.authorHandle, {
            id: `seed_${review.authorHandle}`,
            handle: review.authorHandle,
            displayName: review.authorName,
            avatarUrl: review.authorAvatarUrl,
            provider: review.provider || "x",
          });
        }
      }
    }

    // Add spot creator
    if (!usersToCreate.has(spot.addedBy)) {
      usersToCreate.set(spot.addedBy, {
        id: `seed_${spot.addedBy}`,
        handle: spot.addedBy,
        provider: "x",
      });
    }
  }

  // Insert users
  console.log(`Inserting ${usersToCreate.size} users...`);
  const userValues = Array.from(usersToCreate.values());

  for (const user of userValues) {
    try {
      await db.insert(users).values(user).onConflictDoNothing();
    } catch (error) {
      console.log(`Skipping user ${user.handle} (may already exist)`);
    }
  }
  console.log("Users inserted.\n");

  // Insert spots
  console.log(`Inserting ${spotsData.length} spots...`);
  for (const spot of spotsData) {
    try {
      await db.insert(spotsTable).values({
        id: spot.id,
        name: spot.name,
        cityId: spot.cityId,
        types: spot.types,
        description: spot.description,
        lng: spot.coordinates[0],
        lat: spot.coordinates[1],
        vibes: spot.vibes,
        googleMapsUrl: spot.googleMapsUrl,
        lumaUrl: spot.lumaUrl,
        websiteUrl: spot.websiteUrl,
        twitterUrl: spot.twitterUrl,
        instagramUrl: spot.instagramUrl,
        linkedinUrl: spot.linkedinUrl,
        addedBy: spot.addedBy,
        approved: spot.approved,
        featured: spot.featured || false,
      }).onConflictDoNothing();
      console.log(`  Added spot: ${spot.name}`);
    } catch (error) {
      console.log(`  Skipping spot ${spot.name} (may already exist)`);
    }
  }
  console.log("Spots inserted.\n");

  // Insert upvotes
  console.log("Inserting upvotes...");
  let upvoteCount = 0;
  for (const spot of spotsData) {
    if (spot.upvoters) {
      for (const upvoter of spot.upvoters) {
        try {
          await db.insert(upvotes).values({
            userId: `seed_${upvoter.handle}`,
            spotId: spot.id,
          }).onConflictDoNothing();
          upvoteCount++;
        } catch {
          // Skip duplicates
        }
      }
    }
  }
  console.log(`Inserted ${upvoteCount} upvotes.\n`);

  // Insert reviews
  console.log("Inserting reviews...");
  let reviewCount = 0;
  for (const spot of spotsData) {
    if (spot.reviews) {
      for (const review of spot.reviews) {
        try {
          await db.insert(reviews).values({
            id: review.id,
            spotId: spot.id,
            userId: `seed_${review.authorHandle}`,
            rating: review.rating,
            text: review.text,
            createdAt: new Date(review.createdAt),
          }).onConflictDoNothing();
          reviewCount++;
        } catch {
          // Skip duplicates
        }
      }
    }
  }
  console.log(`Inserted ${reviewCount} reviews.\n`);

  console.log("Seed completed successfully!");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
