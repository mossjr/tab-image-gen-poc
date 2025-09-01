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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TextPositionConfig = z.infer<typeof textPositionSchema>;
export type TextConfig = z.infer<typeof textConfigSchema>;
export type InsertTextPositionConfig = z.infer<typeof insertTextPositionConfigSchema>;
export type SelectTextPositionConfig = typeof textPositionConfigs.$inferSelect;
