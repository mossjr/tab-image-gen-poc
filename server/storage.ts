import { type User, type InsertUser, type TextConfig, type SelectTextPositionConfig, type InsertTextPositionConfig } from "@shared/schema";
import { db } from "./db";
import { users, textPositionConfigs } from "@shared/schema";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTextPositionConfig(name: string): Promise<TextConfig | undefined>;
  saveTextPositionConfig(name: string, config: TextConfig): Promise<SelectTextPositionConfig>;
  listTextPositionConfigs(): Promise<SelectTextPositionConfig[]>;
}


export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTextPositionConfig(name: string): Promise<TextConfig | undefined> {
    const [record] = await db.select().from(textPositionConfigs).where(eq(textPositionConfigs.name, name));
    
    if (!record) {
      // Return default config if none exists
      return await this.createDefaultConfig(name);
    }
    
    return record.config as TextConfig;
  }

  async saveTextPositionConfig(name: string, config: TextConfig): Promise<SelectTextPositionConfig> {
    const [existingRecord] = await db.select().from(textPositionConfigs).where(eq(textPositionConfigs.name, name));
    
    if (existingRecord) {
      // Update existing record
      const [updatedRecord] = await db
        .update(textPositionConfigs)
        .set({ 
          config: config as any,
          updatedAt: new Date()
        })
        .where(eq(textPositionConfigs.name, name))
        .returning();
      return updatedRecord;
    } else {
      // Create new record
      const [newRecord] = await db
        .insert(textPositionConfigs)
        .values({
          name,
          config: config as any,
        })
        .returning();
      return newRecord;
    }
  }

  async listTextPositionConfigs(): Promise<SelectTextPositionConfig[]> {
    return await db.select().from(textPositionConfigs);
  }

  private async createDefaultConfig(name: string): Promise<TextConfig> {
    const defaultConfig: TextConfig = {
      raceName: {
        bottom: 200,
        left: 100,
        alignment: "left",
        fontFamily: "Montserrat-BoldItalic",
        fontSize: 60,
        color: "#1fd87b"
      },
      prizeAmount: {
        bottom: 600,
        left: 200,
        alignment: "left",
        fontFamily: "Montserrat-Black",
        fontSize: 120,
        color: "#ffffff"
      },
      projectedPool: {
        bottom: 700,
        left: 540,
        alignment: "left",
        fontFamily: "Montserrat-BoldItalic",
        fontSize: 48,
        color: "#1fd87b"
      },
      day: {
        bottom: 800,
        left: 700,
        alignment: "left",
        fontFamily: "Montserrat-BoldItalic",
        fontSize: 48,
        color: "#1fd87b"
      },
      numberOfRaces: {
        bottom: 200,
        center: 1340,
        alignment: "center",
        fontFamily: "Montserrat-Bold",
        fontSize: 80,
        color: "#1fd87b"
      }
    };

    // Save default config to database
    await this.saveTextPositionConfig(name, defaultConfig);
    return defaultConfig;
  }
}

export const storage = new DatabaseStorage();
