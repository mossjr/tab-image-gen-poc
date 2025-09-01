import { type User, type InsertUser, type TextConfig, type SelectTextPositionConfig, type InsertTextPositionConfig } from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private textConfigs: Map<string, SelectTextPositionConfig>;

  constructor() {
    this.users = new Map();
    this.textConfigs = new Map();
    this.loadDefaultConfig();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  private loadDefaultConfig(): void {
    // Load default configuration from JSON file
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

    const configRecord: SelectTextPositionConfig = {
      id: 1,
      name: "default",
      config: defaultConfig,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.textConfigs.set("default", configRecord);
  }

  async getTextPositionConfig(name: string): Promise<TextConfig | undefined> {
    const record = this.textConfigs.get(name);
    return record ? record.config as TextConfig : undefined;
  }

  async saveTextPositionConfig(name: string, config: TextConfig): Promise<SelectTextPositionConfig> {
    const existingRecord = this.textConfigs.get(name);
    const record: SelectTextPositionConfig = {
      id: existingRecord?.id || Date.now(),
      name,
      config,
      createdAt: existingRecord?.createdAt || new Date(),
      updatedAt: new Date()
    };

    this.textConfigs.set(name, record);
    return record;
  }

  async listTextPositionConfigs(): Promise<SelectTextPositionConfig[]> {
    return Array.from(this.textConfigs.values());
  }
}

export const storage = new MemStorage();
