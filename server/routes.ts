import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWorkspaceSchema, insertTeamSchema, insertUserTeamSchema, insertBoardSchema, insertColumnSchema, insertTaskSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Workspace routes
  app.get("/api/workspaces", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const workspaces = await storage.getWorkspaces(userId);
    res.json(workspaces);
  });
  
  app.get("/api/workspaces/:id", async (req, res) => {
    const workspaceId = parseInt(req.params.id);
    const workspace = await storage.getWorkspace(workspaceId);
    
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    
    res.json(workspace);
  });
  
  app.post("/api/workspaces", async (req, res) => {
    try {
      const workspaceData = insertWorkspaceSchema.parse(req.body);
      const workspace = await storage.createWorkspace(workspaceData);
      res.status(201).json(workspace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workspace data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });
  
  // Team routes
  app.get("/api/workspaces/:workspaceId/teams", async (req, res) => {
    const workspaceId = parseInt(req.params.workspaceId);
    const teams = await storage.getTeams(workspaceId);
    res.json(teams);
  });
  
  app.post("/api/teams", async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(teamData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create team" });
    }
  });
  
  app.post("/api/user-teams", async (req, res) => {
    try {
      const userTeamData = insertUserTeamSchema.parse(req.body);
      const userTeam = await storage.addUserToTeam(userTeamData);
      res.status(201).json(userTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user team data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add user to team" });
    }
  });
  
  // Board routes
  app.get("/api/workspaces/:workspaceId/boards", async (req, res) => {
    const workspaceId = parseInt(req.params.workspaceId);
    const boards = await storage.getBoards(workspaceId);
    res.json(boards);
  });
  
  app.get("/api/boards/:id", async (req, res) => {
    const boardId = parseInt(req.params.id);
    const board = await storage.getBoard(boardId);
    
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    
    res.json(board);
  });
  
  app.post("/api/boards", async (req, res) => {
    try {
      const boardData = insertBoardSchema.parse(req.body);
      const board = await storage.createBoard(boardData);
      res.status(201).json(board);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid board data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create board" });
    }
  });
  
  app.patch("/api/boards/:id", async (req, res) => {
    const boardId = parseInt(req.params.id);
    try {
      const boardData = req.body;
      const board = await storage.updateBoard(boardId, boardData);
      
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      res.json(board);
    } catch (error) {
      res.status(500).json({ message: "Failed to update board" });
    }
  });
  
  // Column routes
  app.get("/api/boards/:boardId/columns", async (req, res) => {
    const boardId = parseInt(req.params.boardId);
    const columns = await storage.getColumns(boardId);
    res.json(columns);
  });
  
  app.post("/api/columns", async (req, res) => {
    try {
      const columnData = insertColumnSchema.parse(req.body);
      const column = await storage.createColumn(columnData);
      res.status(201).json(column);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid column data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create column" });
    }
  });
  
  app.patch("/api/columns/:id", async (req, res) => {
    const columnId = parseInt(req.params.id);
    try {
      const columnData = req.body;
      const column = await storage.updateColumn(columnId, columnData);
      
      if (!column) {
        return res.status(404).json({ message: "Column not found" });
      }
      
      res.json(column);
    } catch (error) {
      res.status(500).json({ message: "Failed to update column" });
    }
  });
  
  app.delete("/api/columns/:id", async (req, res) => {
    const columnId = parseInt(req.params.id);
    try {
      const success = await storage.deleteColumn(columnId);
      
      if (!success) {
        return res.status(404).json({ message: "Column not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete column" });
    }
  });
  
  // Task routes
  app.get("/api/columns/:columnId/tasks", async (req, res) => {
    const columnId = parseInt(req.params.columnId);
    const tasks = await storage.getTasks(columnId);
    res.json(tasks);
  });
  
  app.get("/api/tasks/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = await storage.getTask(taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(task);
  });
  
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  app.patch("/api/tasks/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    try {
      const taskData = req.body;
      const task = await storage.updateTask(taskId, taskData);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    try {
      const success = await storage.deleteTask(taskId);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  
  app.post("/api/tasks/:id/move", async (req, res) => {
    const taskId = parseInt(req.params.id);
    const { columnId, order } = req.body;
    
    if (typeof columnId !== 'number' || typeof order !== 'number') {
      return res.status(400).json({ message: "columnId and order must be numbers" });
    }
    
    try {
      const task = await storage.moveTask(taskId, columnId, order);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to move task" });
    }
  });
  
  // Comment routes
  app.get("/api/tasks/:taskId/comments", async (req, res) => {
    const taskId = parseInt(req.params.taskId);
    const comments = await storage.getComments(taskId);
    res.json(comments);
  });
  
  app.post("/api/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
