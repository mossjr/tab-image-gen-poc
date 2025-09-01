import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const textPositionConfigs = pgTable("text_position_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  config: json("config").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adContents = pgTable("ad_contents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  raceName: text("race_name").notNull(),
  prizeAmount: text("prize_amount").notNull(),
  projectedPool: text("projected_pool").notNull(),
  day: text("day").notNull(),
  numberOfRaces: text("number_of_races").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const textPositionSchema = z.object({
  bottom: z.number().min(0),
  left: z.number().min(0).optional(),
  center: z.number().min(0).optional(),
  alignment: z.enum(["left", "center"]),
  fontFamily: z.string(),
  fontSize: z.number().min(8).max(300),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const textConfigSchema = z.object({
  raceName: textPositionSchema,
  prizeAmount: textPositionSchema,
  projectedPool: textPositionSchema,
  day: textPositionSchema,
  numberOfRaces: textPositionSchema,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTextPositionConfigSchema = createInsertSchema(textPositionConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const adContentSchema = z.object({
  raceName: z.string().min(1, "Race name is required"),
  prizeAmount: z.string().min(1, "Prize amount is required"),
  projectedPool: z.string().min(1, "Projected pool is required"),
  day: z.string().min(1, "Day is required"),
  numberOfRaces: z.string().min(1, "Number of races is required"),
});

export const insertAdContentSchema = createInsertSchema(adContents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TextPositionConfig = z.infer<typeof textPositionSchema>;
export type TextConfig = z.infer<typeof textConfigSchema>;
export type InsertTextPositionConfig = z.infer<typeof insertTextPositionConfigSchema>;
export type SelectTextPositionConfig = typeof textPositionConfigs.$inferSelect;
export type AdContent = z.infer<typeof adContentSchema>;
export type InsertAdContent = z.infer<typeof insertAdContentSchema>;
export type SelectAdContent = typeof adContents.$inferSelect;
