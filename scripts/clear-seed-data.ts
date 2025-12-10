import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function clearSeedData() {
  console.log("Clearing seed data...\n");

  // Delete reviews
  await sql`DELETE FROM reviews`;
  console.log("Cleared reviews");

  // Delete upvotes
  await sql`DELETE FROM upvotes`;
  console.log("Cleared upvotes");

  // Delete seed users (users created during seeding)
  await sql`DELETE FROM users WHERE id LIKE 'seed_%'`;
  console.log("Cleared seed users");

  console.log("\nDone! Database now has real spots but no fake upvotes/reviews/users.");
}

clearSeedData().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});
