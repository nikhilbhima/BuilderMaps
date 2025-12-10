import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  doublePrecision,
  primaryKey,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(), // UUID or social ID
  email: text("email").unique(),
  handle: text("handle").notNull(), // X or LinkedIn handle
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  provider: text("provider").notNull(), // 'x', 'linkedin', or 'email'
  passwordHash: text("password_hash"), // For email auth
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Spots table
export const spots = pgTable("spots", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cityId: text("city_id").notNull(),
  types: text("types").array().notNull(), // ['coworking', 'cafe', etc.]
  description: text("description").notNull(),
  lng: doublePrecision("lng").notNull(),
  lat: doublePrecision("lat").notNull(),
  vibes: text("vibes").array().notNull(),
  googleMapsUrl: text("google_maps_url"),
  lumaUrl: text("luma_url"),
  websiteUrl: text("website_url"),
  twitterUrl: text("twitter_url"),
  instagramUrl: text("instagram_url"),
  linkedinUrl: text("linkedin_url"),
  addedBy: text("added_by").notNull(), // User handle who added it
  approved: boolean("approved").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Upvotes table (many-to-many: users <-> spots)
export const upvotes = pgTable(
  "upvotes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    spotId: text("spot_id")
      .notNull()
      .references(() => spots.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.spotId] }),
  })
);

// Reviews table
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  spotId: text("spot_id")
    .notNull()
    .references(() => spots.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Nominations table (pending spot submissions)
export const nominations = pgTable("nominations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cityId: text("city_id").notNull(),
  types: text("types").array().notNull(),
  description: text("description").notNull(),
  lng: doublePrecision("lng"),
  lat: doublePrecision("lat"),
  vibes: text("vibes").array(),
  googleMapsUrl: text("google_maps_url"),
  websiteUrl: text("website_url"),
  twitterHandle: text("twitter_handle"),
  instagramHandle: text("instagram_handle"),
  linkedinUrl: text("linkedin_url"),
  submittedBy: text("submitted_by"), // User ID if logged in
  submitterEmail: text("submitter_email"), // If not logged in
  status: text("status").default("pending").notNull(), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// City requests table
export const cityRequests = pgTable("city_requests", {
  id: text("id").primaryKey(),
  cityName: text("city_name").notNull(),
  requestedBy: text("requested_by"), // User ID
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  status: text("status").default("pending").notNull(),
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Spot = typeof spots.$inferSelect;
export type NewSpot = typeof spots.$inferInsert;
export type Upvote = typeof upvotes.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Nomination = typeof nominations.$inferSelect;
export type NewNomination = typeof nominations.$inferInsert;
