import { 
  type User, 
  type InsertUser, 
  type ChatMessage, 
  type InsertChatMessage,
  type FolderInfo,
  type XMLFileInfo
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { XMLParser } from "fast-xml-parser";

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
  scanXMLFiles(folderPath: string): Promise<XMLFileInfo[]>;
  validateXMLFile(filePath: string): Promise<XMLFileInfo>;
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
    const validCount = xmlFiles.filter(file => file.isValid).length;
    const invalidCount = xmlFiles.length - validCount;
    
    this.currentFolder = {
      path: folderPath,
      xmlFiles,
      validFileCount: validCount,
      invalidFileCount: invalidCount,
      lastScanned: new Date().toISOString()
    };
  }

  async getCurrentFolder(): Promise<FolderInfo | null> {
    return this.currentFolder;
  }

  async validateXMLFile(filePath: string): Promise<XMLFileInfo> {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });

    const fileName = path.basename(filePath);
    const errors: string[] = [];
    let isValid = false;
    let documentType: string | undefined;
    let period: string | undefined;
    let company: string | undefined;

    try {
      // Get file stats
      const stats = await fs.stat(filePath);
      
      // Read file content
      const xmlContent = await fs.readFile(filePath, 'utf8');
      
      // Validate XML parsing
      try {
        const parsedData = parser.parse(xmlContent);
        isValid = true;

        // Extract metadata based on document structure
        if (parsedData.financial_statement) {
          documentType = parsedData.financial_statement.type || "financial_statement";
          period = parsedData.financial_statement.period;
          company = parsedData.financial_statement.company;
        } else if (parsedData.expense_report) {
          documentType = "expense_report";
          period = parsedData.expense_report.period;
          company = parsedData.expense_report.company;
        } else if (parsedData.financial) {
          documentType = "general_financial";
        }

      } catch (parseError: any) {
        errors.push(`XML parsing failed: ${parseError.message}`);
      }

      return {
        filePath,
        fileName,
        isValid,
        fileSize: stats.size,
        lastModified: stats.mtime.toISOString(),
        documentType,
        period,
        company,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error: any) {
      errors.push(`File access error: ${error.message}`);
      
      return {
        filePath,
        fileName,
        isValid: false,
        fileSize: 0,
        lastModified: new Date().toISOString(),
        errors
      };
    }
  }

  async scanXMLFiles(folderPath: string): Promise<XMLFileInfo[]> {
    try {
      const files = await fs.readdir(folderPath);
      const xmlFileInfos: XMLFileInfo[] = [];

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);
        
        // Only process XML files
        if (stats.isFile() && path.extname(file).toLowerCase() === '.xml') {
          const fileInfo = await this.validateXMLFile(filePath);
          xmlFileInfos.push(fileInfo);
        }
      }

      return xmlFileInfos;
    } catch (error) {
      console.error("Error scanning XML files:", error);
      return [];
    }
  }
}

export const storage = new MemStorage();
