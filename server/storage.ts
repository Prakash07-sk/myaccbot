import { 
  type User, 
  type InsertUser, 
  type ChatMessage, 
  type InsertChatMessage,
  type FolderInfo
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat functionality
  storeMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getAllMessages(): Promise<ChatMessage[]>;
  clearMessages(): Promise<void>;
  
  // File handling functionality
  storeFolderPath(folderPath: string): Promise<void>;
  getCurrentFolder(): Promise<FolderInfo | null>;
  scanXMLFiles(folderPath: string): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: ChatMessage[] = [];
  private currentFolder: FolderInfo | null = null;

  constructor() {
    this.users = new Map();
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

  // Chat functionality implementation
  async storeMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      id: randomUUID(),
      ...message
    };
    this.messages.push(chatMessage);
    return chatMessage;
  }

  async getAllMessages(): Promise<ChatMessage[]> {
    return [...this.messages];
  }

  async clearMessages(): Promise<void> {
    this.messages = [];
  }

  // File handling functionality
  async storeFolderPath(folderPath: string): Promise<void> {
    const xmlFiles = await this.scanXMLFiles(folderPath);
    this.currentFolder = {
      path: folderPath,
      xmlFiles,
      lastScanned: new Date().toISOString()
    };
  }

  async getCurrentFolder(): Promise<FolderInfo | null> {
    return this.currentFolder;
  }

  async scanXMLFiles(folderPath: string): Promise<string[]> {
    try {
      const files = await fs.readdir(folderPath);
      const xmlFiles: string[] = [];

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile() && path.extname(file).toLowerCase() === '.xml') {
          xmlFiles.push(filePath);
        }
      }

      return xmlFiles;
    } catch (error) {
      console.error("Error scanning XML files:", error);
      return [];
    }
  }
}

export const storage = new MemStorage();
