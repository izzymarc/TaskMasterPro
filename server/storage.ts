import {
  users, tasks, columns, boards, workspaces, teams, userTeams, comments,
  type User, type Task, type Column, type Board, type Workspace, type Team, type UserTeam, type Comment,
  type InsertUser, type InsertTask, type InsertColumn, type InsertBoard, type InsertWorkspace, type InsertTeam, type InsertUserTeam, type InsertComment
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workspace operations
  getWorkspaces(userId: number): Promise<Workspace[]>;
  getWorkspace(id: number): Promise<Workspace | undefined>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  
  // Team operations
  getTeams(workspaceId: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  
  // UserTeam operations
  getUserTeams(userId: number): Promise<(UserTeam & { team: Team })[]>;
  addUserToTeam(userTeam: InsertUserTeam): Promise<UserTeam>;
  
  // Board operations
  getBoards(workspaceId: number): Promise<Board[]>;
  getBoard(id: number): Promise<Board | undefined>;
  createBoard(board: InsertBoard): Promise<Board>;
  updateBoard(id: number, board: Partial<Board>): Promise<Board | undefined>;
  
  // Column operations
  getColumns(boardId: number): Promise<Column[]>;
  getColumn(id: number): Promise<Column | undefined>;
  createColumn(column: InsertColumn): Promise<Column>;
  updateColumn(id: number, column: Partial<Column>): Promise<Column | undefined>;
  deleteColumn(id: number): Promise<boolean>;
  
  // Task operations
  getTasks(columnId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  moveTask(taskId: number, newColumnId: number, newOrder: number): Promise<Task | undefined>;
  
  // Comment operations
  getComments(taskId: number): Promise<(Comment & { user: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workspaces: Map<number, Workspace>;
  private teams: Map<number, Team>;
  private userTeams: Map<number, UserTeam>;
  private boards: Map<number, Board>;
  private columns: Map<number, Column>;
  private tasks: Map<number, Task>;
  private comments: Map<number, Comment>;
  
  private userIdCounter: number;
  private workspaceIdCounter: number;
  private teamIdCounter: number;
  private userTeamIdCounter: number;
  private boardIdCounter: number;
  private columnIdCounter: number;
  private taskIdCounter: number;
  private commentIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.workspaces = new Map();
    this.teams = new Map();
    this.userTeams = new Map();
    this.boards = new Map();
    this.columns = new Map();
    this.tasks = new Map();
    this.comments = new Map();
    
    this.userIdCounter = 1;
    this.workspaceIdCounter = 1;
    this.teamIdCounter = 1;
    this.userTeamIdCounter = 1;
    this.boardIdCounter = 1;
    this.columnIdCounter = 1;
    this.taskIdCounter = 1;
    this.commentIdCounter = 1;
    
    // Initialize with some demo data
    this.initializeDemoData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const newUser: User = { 
      ...user, 
      id,
      createdAt: now
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Workspace operations
  async getWorkspaces(userId: number): Promise<Workspace[]> {
    return Array.from(this.workspaces.values())
      .filter(workspace => workspace.ownerId === userId);
  }
  
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    return this.workspaces.get(id);
  }
  
  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const id = this.workspaceIdCounter++;
    const now = new Date();
    const newWorkspace: Workspace = {
      ...workspace,
      id,
      createdAt: now
    };
    this.workspaces.set(id, newWorkspace);
    return newWorkspace;
  }
  
  // Team operations
  async getTeams(workspaceId: number): Promise<Team[]> {
    return Array.from(this.teams.values())
      .filter(team => team.workspaceId === workspaceId);
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }
  
  async createTeam(team: InsertTeam): Promise<Team> {
    const id = this.teamIdCounter++;
    const now = new Date();
    const newTeam: Team = {
      ...team,
      id,
      createdAt: now
    };
    this.teams.set(id, newTeam);
    return newTeam;
  }
  
  // UserTeam operations
  async getUserTeams(userId: number): Promise<(UserTeam & { team: Team })[]> {
    const userTeams = Array.from(this.userTeams.values())
      .filter(userTeam => userTeam.userId === userId);
    
    return userTeams.map(userTeam => {
      const team = this.teams.get(userTeam.teamId)!;
      return { ...userTeam, team };
    });
  }
  
  async addUserToTeam(userTeam: InsertUserTeam): Promise<UserTeam> {
    const id = this.userTeamIdCounter++;
    const newUserTeam: UserTeam = {
      ...userTeam,
      id
    };
    this.userTeams.set(id, newUserTeam);
    return newUserTeam;
  }
  
  // Board operations
  async getBoards(workspaceId: number): Promise<Board[]> {
    return Array.from(this.boards.values())
      .filter(board => board.workspaceId === workspaceId);
  }
  
  async getBoard(id: number): Promise<Board | undefined> {
    return this.boards.get(id);
  }
  
  async createBoard(board: InsertBoard): Promise<Board> {
    const id = this.boardIdCounter++;
    const now = new Date();
    const newBoard: Board = {
      ...board,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.boards.set(id, newBoard);
    return newBoard;
  }
  
  async updateBoard(id: number, board: Partial<Board>): Promise<Board | undefined> {
    const existingBoard = this.boards.get(id);
    if (!existingBoard) return undefined;
    
    const updatedBoard: Board = {
      ...existingBoard,
      ...board,
      updatedAt: new Date()
    };
    this.boards.set(id, updatedBoard);
    return updatedBoard;
  }
  
  // Column operations
  async getColumns(boardId: number): Promise<Column[]> {
    return Array.from(this.columns.values())
      .filter(column => column.boardId === boardId)
      .sort((a, b) => a.order - b.order);
  }
  
  async getColumn(id: number): Promise<Column | undefined> {
    return this.columns.get(id);
  }
  
  async createColumn(column: InsertColumn): Promise<Column> {
    const id = this.columnIdCounter++;
    const newColumn: Column = {
      ...column,
      id
    };
    this.columns.set(id, newColumn);
    return newColumn;
  }
  
  async updateColumn(id: number, column: Partial<Column>): Promise<Column | undefined> {
    const existingColumn = this.columns.get(id);
    if (!existingColumn) return undefined;
    
    const updatedColumn: Column = {
      ...existingColumn,
      ...column
    };
    this.columns.set(id, updatedColumn);
    return updatedColumn;
  }
  
  async deleteColumn(id: number): Promise<boolean> {
    // Delete all tasks in the column first
    const tasksToDelete = Array.from(this.tasks.values())
      .filter(task => task.columnId === id);
    
    for (const task of tasksToDelete) {
      await this.deleteTask(task.id);
    }
    
    return this.columns.delete(id);
  }
  
  // Task operations
  async getTasks(columnId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    const newTask: Task = {
      ...task,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(id, newTask);
    return newTask;
  }
  
  async updateTask(id: number, task: Partial<Task>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask: Task = {
      ...existingTask,
      ...task,
      updatedAt: new Date()
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    // Delete all comments for the task first
    const commentsToDelete = Array.from(this.comments.values())
      .filter(comment => comment.taskId === id);
    
    for (const comment of commentsToDelete) {
      this.comments.delete(comment.id);
    }
    
    return this.tasks.delete(id);
  }
  
  async moveTask(taskId: number, newColumnId: number, newOrder: number): Promise<Task | undefined> {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;
    
    // If moving to a different column, update order of tasks in both columns
    if (task.columnId !== newColumnId) {
      // Update task with new column and order
      const updatedTask = await this.updateTask(taskId, { 
        columnId: newColumnId, 
        order: newOrder 
      });
      
      // Reorder tasks in the old column
      const oldColumnTasks = await this.getTasks(task.columnId);
      for (let i = 0; i < oldColumnTasks.length; i++) {
        if (oldColumnTasks[i].id !== taskId) {
          await this.updateTask(oldColumnTasks[i].id, { order: i });
        }
      }
      
      // Reorder tasks in the new column
      const newColumnTasks = await this.getTasks(newColumnId);
      for (let i = 0; i < newColumnTasks.length; i++) {
        if (i >= newOrder && newColumnTasks[i].id !== taskId) {
          await this.updateTask(newColumnTasks[i].id, { order: i + 1 });
        }
      }
      
      return updatedTask;
    } else {
      // Just reordering within the same column
      const columnTasks = await this.getTasks(task.columnId);
      const oldOrder = task.order;
      
      // Update task with new order
      const updatedTask = await this.updateTask(taskId, { order: newOrder });
      
      // Adjust other tasks' orders
      if (oldOrder < newOrder) {
        // Moving down
        for (const t of columnTasks) {
          if (t.id !== taskId && t.order > oldOrder && t.order <= newOrder) {
            await this.updateTask(t.id, { order: t.order - 1 });
          }
        }
      } else if (oldOrder > newOrder) {
        // Moving up
        for (const t of columnTasks) {
          if (t.id !== taskId && t.order >= newOrder && t.order < oldOrder) {
            await this.updateTask(t.id, { order: t.order + 1 });
          }
        }
      }
      
      return updatedTask;
    }
  }
  
  // Comment operations
  async getComments(taskId: number): Promise<(Comment & { user: User })[]> {
    const taskComments = Array.from(this.comments.values())
      .filter(comment => comment.taskId === taskId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    return taskComments.map(comment => {
      const user = this.users.get(comment.userId)!;
      return { ...comment, user };
    });
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const now = new Date();
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: now
    };
    this.comments.set(id, newComment);
    return newComment;
  }
  
  private initializeDemoData() {
    // Create demo users
    const user1 = this.createUser({
      username: 'alex',
      password: 'password123',
      email: 'alex@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const user2 = this.createUser({
      username: 'sarah',
      password: 'password123',
      email: 'sarah@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const user3 = this.createUser({
      username: 'michael',
      password: 'password123',
      email: 'michael@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80'
    });
    
    const user4 = this.createUser({
      username: 'olivia',
      password: 'password123',
      email: 'olivia@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    // Create workspaces
    const workspace1 = this.createWorkspace({
      name: 'Product Team',
      ownerId: 1
    });
    
    const workspace2 = this.createWorkspace({
      name: 'Marketing',
      ownerId: 1
    });
    
    const workspace3 = this.createWorkspace({
      name: 'Engineering',
      ownerId: 3
    });
    
    // Create teams
    const team1 = this.createTeam({
      name: 'Frontend',
      workspaceId: 1
    });
    
    const team2 = this.createTeam({
      name: 'Design Team',
      workspaceId: 1
    });
    
    const team3 = this.createTeam({
      name: 'QA Team',
      workspaceId: 1
    });
    
    // Add users to teams
    this.addUserToTeam({
      userId: 1,
      teamId: 1,
      role: 'admin'
    });
    
    this.addUserToTeam({
      userId: 2,
      teamId: 1,
      role: 'member'
    });
    
    this.addUserToTeam({
      userId: 2,
      teamId: 2,
      role: 'admin'
    });
    
    this.addUserToTeam({
      userId: 3,
      teamId: 3,
      role: 'admin'
    });
    
    this.addUserToTeam({
      userId: 4,
      teamId: 3,
      role: 'member'
    });
    
    // Create boards
    const board1 = this.createBoard({
      name: 'Product Team Board',
      workspaceId: 1
    });
    
    // Create columns
    const column1 = this.createColumn({
      name: 'To Do',
      boardId: 1,
      order: 0
    });
    
    const column2 = this.createColumn({
      name: 'In Progress',
      boardId: 1,
      order: 1
    });
    
    const column3 = this.createColumn({
      name: 'Code Review',
      boardId: 1,
      order: 2
    });
    
    const column4 = this.createColumn({
      name: 'Done',
      boardId: 1,
      order: 3
    });
    
    // Create tasks for To Do column
    this.createTask({
      title: 'Implement user authentication',
      description: 'Set up Firebase Auth for email/password and Google login',
      columnId: 1,
      order: 0,
      assigneeId: 1,
      priority: 'high',
      dueDate: new Date('2023-05-10'),
      category: 'feature',
      isCompleted: false
    });
    
    this.createTask({
      title: 'Design dashboard layout',
      description: 'Create responsive layout for main dashboard view',
      columnId: 1,
      order: 1,
      assigneeId: 2,
      priority: 'medium',
      dueDate: new Date('2023-05-12'),
      category: 'ui',
      isCompleted: false
    });
    
    this.createTask({
      title: 'Set up Firebase Firestore',
      description: 'Configure database rules and initial collections',
      columnId: 1,
      order: 2,
      assigneeId: 1,
      priority: 'low',
      dueDate: new Date('2023-05-15'),
      category: 'api',
      isCompleted: false
    });
    
    // Create tasks for In Progress column
    this.createTask({
      title: 'Research drag-and-drop libraries',
      description: 'Evaluate React DnD vs. react-beautiful-dnd',
      columnId: 2,
      order: 0,
      assigneeId: 2,
      priority: 'high',
      dueDate: new Date('2023-05-08'),
      category: 'research',
      isCompleted: false
    });
    
    this.createTask({
      title: 'Create Redux store',
      description: 'Set up action creators and reducers',
      columnId: 2,
      order: 1,
      assigneeId: 3,
      priority: 'medium',
      dueDate: new Date('2023-05-11'),
      category: 'backend',
      isCompleted: false
    });
    
    this.createTask({
      title: 'Implement responsive UI',
      description: 'Create mobile-friendly layout',
      columnId: 2,
      order: 2,
      assigneeId: 2,
      priority: 'medium',
      dueDate: new Date('2023-05-14'),
      category: 'frontend',
      isCompleted: false
    });
    
    // Create tasks for Code Review column
    this.createTask({
      title: 'Implement drag and drop',
      description: 'Integrate React DnD for task management',
      columnId: 3,
      order: 0,
      assigneeId: 1,
      priority: 'high',
      dueDate: new Date('2023-05-09'),
      category: 'feature',
      isCompleted: false
    });
    
    this.createTask({
      title: 'Fix Firebase authentication issues',
      description: 'Resolve Google sign-in redirect errors',
      columnId: 3,
      order: 1,
      assigneeId: 1,
      priority: 'medium',
      dueDate: new Date('2023-05-09'),
      category: 'bug',
      isCompleted: false
    });
    
    // Create tasks for Done column
    this.createTask({
      title: 'Project setup',
      description: 'Initialize React project with create-react-app',
      columnId: 4,
      order: 0,
      assigneeId: 3,
      priority: 'low',
      dueDate: new Date('2023-05-05'),
      category: 'ui',
      isCompleted: true
    });
    
    this.createTask({
      title: 'Install required dependencies',
      description: 'Set up Redux, Firebase, and React DnD packages',
      columnId: 4,
      order: 1,
      assigneeId: 1,
      priority: 'low',
      dueDate: new Date('2023-05-06'),
      category: 'frontend',
      isCompleted: true
    });
    
    // Add comments to tasks
    this.createComment({
      content: 'Let\'s use Firebase Auth for this project',
      taskId: 1,
      userId: 1
    });
    
    this.createComment({
      content: 'I\'ll start on the UI design tomorrow',
      taskId: 2,
      userId: 2
    });
    
    this.createComment({
      content: 'We need to make sure security rules are properly configured',
      taskId: 3,
      userId: 3
    });
  }
}

export const storage = new MemStorage();
