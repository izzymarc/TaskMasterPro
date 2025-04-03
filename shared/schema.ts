import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userTeams = pgTable("user_teams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  role: text("role").default("member").notNull(),
});

export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const columns = pgTable("columns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  boardId: integer("board_id").notNull().references(() => boards.id),
  order: integer("order").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  columnId: integer("column_id").notNull().references(() => columns.id),
  order: integer("order").notNull(),
  assigneeId: integer("assignee_id").references(() => users.id),
  priority: text("priority").default("medium").notNull(), // low, medium, high
  dueDate: timestamp("due_date"),
  category: text("category").notNull(), // feature, bug, ui, api, research, etc.
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  avatarUrl: true,
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).pick({
  name: true,
  ownerId: true,
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  workspaceId: true,
});

export const insertUserTeamSchema = createInsertSchema(userTeams).pick({
  userId: true,
  teamId: true,
  role: true,
});

export const insertBoardSchema = createInsertSchema(boards).pick({
  name: true,
  workspaceId: true,
});

export const insertColumnSchema = createInsertSchema(columns).pick({
  name: true,
  boardId: true,
  order: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  columnId: true,
  order: true,
  assigneeId: true,
  priority: true,
  dueDate: true,
  category: true,
  isCompleted: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  taskId: true,
  userId: true,
});

// Select types
export type User = typeof users.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type UserTeam = typeof userTeams.$inferSelect;
export type Board = typeof boards.$inferSelect;
export type Column = typeof columns.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Comment = typeof comments.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertUserTeam = z.infer<typeof insertUserTeamSchema>;
export type InsertBoard = z.infer<typeof insertBoardSchema>;
export type InsertColumn = z.infer<typeof insertColumnSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
