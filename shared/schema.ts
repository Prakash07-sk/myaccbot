import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Chat message schemas
export const chatMessageSchema = z.object({
  id: z.string(),
  text: z.string(),
  isUser: z.boolean(),
  timestamp: z.string(),
});

export const insertChatMessageSchema = chatMessageSchema.omit({ id: true });

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Folder info schema
export const folderInfoSchema = z.object({
  path: z.string(),
  xmlFiles: z.array(z.string()),
  lastScanned: z.string(),
});

export type FolderInfo = z.infer<typeof folderInfoSchema>;

// API request schemas
export const pathRequestSchema = z.object({
  path: z.string().min(1, "Path is required").refine(
    (path) => {
      // Only allow paths within the ./test-data directory for security
      const normalizedPath = path.replace(/\\/g, '/');
      return normalizedPath.startsWith('./test-data') || normalizedPath.startsWith('test-data');
    },
    "Path must be within the test-data directory"
  ),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required").max(10000, "Message too long"),
});

export type PathRequest = z.infer<typeof pathRequestSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
