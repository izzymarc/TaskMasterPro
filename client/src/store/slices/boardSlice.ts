import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { Board, Column, Task, Comment } from '@shared/schema';

interface BoardState {
  currentBoard: Board | null;
  columns: Column[];
  tasks: { [columnId: number]: Task[] };
  comments: { [taskId: number]: Comment[] };
  loading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  currentBoard: null,
  columns: [],
  tasks: {},
  comments: {},
  loading: false,
  error: null,
};

// Async thunks
export const fetchBoard = createAsyncThunk(
  'board/fetchBoard',
  async (boardId: number) => {
    const response = await apiRequest('GET', `/api/boards/${boardId}`);
    return await response.json();
  }
);

export const fetchColumns = createAsyncThunk(
  'board/fetchColumns',
  async (boardId: number) => {
    const response = await apiRequest('GET', `/api/boards/${boardId}/columns`);
    return await response.json();
  }
);

export const fetchTasks = createAsyncThunk(
  'board/fetchTasks',
  async (columnId: number) => {
    const response = await apiRequest('GET', `/api/columns/${columnId}/tasks`);
    const tasks = await response.json();
    return { columnId, tasks };
  }
);

export const createColumn = createAsyncThunk(
  'board/createColumn',
  async (column: { name: string; boardId: number; order: number }) => {
    const response = await apiRequest('POST', '/api/columns', column);
    return await response.json();
  }
);

export const updateColumn = createAsyncThunk(
  'board/updateColumn',
  async ({ id, data }: { id: number; data: Partial<Column> }) => {
    const response = await apiRequest('PATCH', `/api/columns/${id}`, data);
    return await response.json();
  }
);

export const deleteColumn = createAsyncThunk(
  'board/deleteColumn',
  async (id: number) => {
    await apiRequest('DELETE', `/api/columns/${id}`);
    return id;
  }
);

export const createTask = createAsyncThunk(
  'board/createTask',
  async (task: {
    title: string;
    description?: string;
    columnId: number;
    order: number;
    assigneeId?: number;
    priority: string;
    dueDate?: Date;
    category: string;
  }) => {
    const response = await apiRequest('POST', '/api/tasks', task);
    return await response.json();
  }
);

export const updateTask = createAsyncThunk(
  'board/updateTask',
  async ({ id, data }: { id: number; data: Partial<Task> }) => {
    const response = await apiRequest('PATCH', `/api/tasks/${id}`, data);
    return await response.json();
  }
);

export const deleteTask = createAsyncThunk(
  'board/deleteTask',
  async (id: number) => {
    await apiRequest('DELETE', `/api/tasks/${id}`);
    return id;
  }
);

export const moveTask = createAsyncThunk(
  'board/moveTask',
  async ({ id, columnId, order }: { id: number; columnId: number; order: number }) => {
    const response = await apiRequest('POST', `/api/tasks/${id}/move`, { columnId, order });
    return await response.json();
  }
);

export const fetchComments = createAsyncThunk(
  'board/fetchComments',
  async (taskId: number) => {
    const response = await apiRequest('GET', `/api/tasks/${taskId}/comments`);
    const comments = await response.json();
    return { taskId, comments };
  }
);

export const createComment = createAsyncThunk(
  'board/createComment',
  async (comment: { content: string; taskId: number; userId: number }) => {
    const response = await apiRequest('POST', '/api/comments', comment);
    return await response.json();
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setBoard: (state, action: PayloadAction<Board>) => {
      state.currentBoard = action.payload;
    },
    clearBoard: (state) => {
      state.currentBoard = null;
      state.columns = [];
      state.tasks = {};
      state.comments = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch board';
      })
      .addCase(fetchColumns.fulfilled, (state, action) => {
        state.columns = action.payload;
        // Initialize empty task arrays for each column
        action.payload.forEach(column => {
          if (!state.tasks[column.id]) {
            state.tasks[column.id] = [];
          }
        });
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const { columnId, tasks } = action.payload;
        state.tasks[columnId] = tasks;
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.columns.push(action.payload);
        state.tasks[action.payload.id] = [];
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        const index = state.columns.findIndex(col => col.id === action.payload.id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.columns = state.columns.filter(col => col.id !== action.payload);
        delete state.tasks[action.payload];
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const { columnId } = action.payload;
        if (!state.tasks[columnId]) {
          state.tasks[columnId] = [];
        }
        state.tasks[columnId].push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { id, columnId } = action.payload;
        if (state.tasks[columnId]) {
          const index = state.tasks[columnId].findIndex(task => task.id === id);
          if (index !== -1) {
            state.tasks[columnId][index] = action.payload;
          }
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        // Find the task in all columns and remove it
        Object.keys(state.tasks).forEach(columnId => {
          state.tasks[Number(columnId)] = state.tasks[Number(columnId)].filter(
            task => task.id !== action.payload
          );
        });
        // Remove any comments for the task
        delete state.comments[action.payload];
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        const task = action.payload;
        const { id, columnId: newColumnId } = task;
        
        // Find the task in all columns to determine the old column
        let oldColumnId: number | null = null;
        
        Object.keys(state.tasks).forEach(columnId => {
          const numColumnId = Number(columnId);
          const index = state.tasks[numColumnId].findIndex(t => t.id === id);
          
          if (index !== -1) {
            oldColumnId = numColumnId;
            // Remove the task from its old column
            state.tasks[numColumnId] = state.tasks[numColumnId].filter(t => t.id !== id);
          }
        });
        
        // Add the task to its new column
        if (!state.tasks[newColumnId]) {
          state.tasks[newColumnId] = [];
        }
        
        // Insert task at the correct position based on order
        const insertIndex = task.order;
        state.tasks[newColumnId].splice(insertIndex, 0, task);
        
        // Re-sort the tasks in the column by order
        state.tasks[newColumnId].sort((a, b) => a.order - b.order);
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { taskId, comments } = action.payload;
        state.comments[taskId] = comments;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { taskId } = action.payload;
        if (!state.comments[taskId]) {
          state.comments[taskId] = [];
        }
        state.comments[taskId].push(action.payload);
      });
  },
});

export const { setBoard, clearBoard } = boardSlice.actions;
export default boardSlice.reducer;
