import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  integer,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1. Players
export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 2. Opponents
export const opponents = pgTable("opponents", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  logoUrl: text("logoUrl"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 3. Games
export const games = pgTable(
  "games",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    opponentId: uuid("opponent_id")
      .notNull()
      .references(() => opponents.id, { onDelete: "restrict" }),

    // Datos del partido
    date: date("date").notNull(),
    location: varchar("location", { length: 10 })
      .$type<"home" | "away">()
      .notNull(),
    teamScore: integer("team_score").notNull(),
    opponentScore: integer("opponent_score").notNull(),

    // Estadísticas individuales de Nara (Opcionales)
    playerPoints: integer("player_points"),
    rebounds: integer("rebounds"),
    assists: integer("assists"),
    steals: integer("steals"),
    turnovers: integer("turnovers"),
    threePointers: integer("three_pointers"),
    twoPointers: integer("two_pointers"),
    freeThrows: integer("free_throws"),

    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("location_check", sql`${table.location} IN ('home', 'away')`),
    check("team_score_check", sql`${table.teamScore} >= 0`),
    check("opponent_score_check", sql`${table.opponentScore} >= 0`),
    check(
      "player_points_check",
      sql`${table.playerPoints} IS NULL OR (${table.playerPoints} >= 0 AND ${table.playerPoints} <= ${table.teamScore})`,
    ),
  ],
);
