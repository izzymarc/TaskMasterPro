import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Board, Column, Task } from '@shared/schema';

interface BoardState {
  currentBoard: Board | null;
  columns: Column[];
  tasks: Record<number, Task[]>;
  loading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  currentBoard: null,
  columns: [],
  tasks: {},
  loading: false,
  error: null
};

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setCurrentBoard: (state, action: PayloadAction<Board>) => {
      state.currentBoard = action.payload;
    },
    setColumns: (state, action: PayloadAction<Column[]>) => {
      state.columns = action.payload;
    },
    setTasks: (state, action: PayloadAction<{ columnId: number, tasks: Task[] }>) => {
      const { columnId, tasks } = action.payload;
      state.tasks[columnId] = tasks;
    },
    addColumn: (state, action: PayloadAction<Column>) => {
      state.columns.push(action.payload);
      state.tasks[action.payload.id] = [];
    },
    updateColumn: (state, action: PayloadAction<Column>) => {
      const index = state.columns.findIndex(col => col.id === action.payload.id);
      if (index !== -1) {
        state.columns[index] = action.payload;
      }
    },
    removeColumn: (state, action: PayloadAction<number>) => {
      state.columns = state.columns.filter(col => col.id !== action.payload);
      delete state.tasks[action.payload];
    },
    addTask: (state, action: PayloadAction<{ columnId: number, task: Task }>) => {
      const { columnId, task } = action.payload;
      if (!state.tasks[columnId]) {
        state.tasks[columnId] = [];
      }
      state.tasks[columnId].push(task);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const { columnId } = action.payload;
      const index = state.tasks[columnId]?.findIndex(task => task.id === action.payload.id);
      if (index !== undefined && index !== -1) {
        state.tasks[columnId][index] = action.payload;
      }
    },
    removeTask: (state, action: PayloadAction<{ columnId: number, taskId: number }>) => {
      const { columnId, taskId } = action.payload;
      if (state.tasks[columnId]) {
        state.tasks[columnId] = state.tasks[columnId].filter(task => task.id !== taskId);
      }
    },
    moveTask: (state, action: PayloadAction<{ 
      taskId: number;
      sourceColumnId: number;
      destinationColumnId: number;
      newIndex: number;
    }>) => {
      const { taskId, sourceColumnId, destinationColumnId, newIndex } = action.payload;
      
      // Find task in source column
      const sourceTaskIndex = state.tasks[sourceColumnId]?.findIndex(task => task.id === taskId);
      
      if (sourceTaskIndex !== undefined && sourceTaskIndex !== -1) {
        // Copy the task
        const [movedTask] = state.tasks[sourceColumnId].splice(sourceTaskIndex, 1);
        
        // Update task column ID
        const updatedTask = { ...movedTask, columnId: destinationColumnId, order: newIndex };
        
        // Ensure destination column tasks array exists
        if (!state.tasks[destinationColumnId]) {
          state.tasks[destinationColumnId] = [];
        }
        
        // Insert at the correct position
        state.tasks[destinationColumnId].splice(newIndex, 0, updatedTask);
        
        // Update order of all tasks in destination column
        state.tasks[destinationColumnId] = state.tasks[destinationColumnId].map((task, index) => ({
          ...task,
          order: index
        }));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearBoardState: (state) => {
      state.currentBoard = null;
      state.columns = [];
      state.tasks = {};
      state.loading = false;
      state.error = null;
    }
  }
});

export const { 
  setCurrentBoard, 
  setColumns, 
  setTasks,
  addColumn,
  updateColumn,
  removeColumn,
  addTask,
  updateTask,
  removeTask,
  moveTask,
  setLoading, 
  setError,
  clearBoardState
} = boardSlice.actions;

// Aliases for remove actions to maintain compatibility with existing code
export const deleteTask = removeTask;
export const deleteColumn = removeColumn;

// Async actions for board operations
export const createTask = (taskData: any) => (dispatch: any) => {
  // In a real application, you would make an API call here
  const newTask = {
    ...taskData,
    id: Date.now(), // Generate a temporary ID
    createdAt: new Date(),
  };
  
  dispatch(addTask({ 
    columnId: newTask.columnId, 
    task: newTask 
  }));
  
  return newTask;
};

export const fetchColumns = (boardId: number) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Mock data for now
    const mockColumns = [
      { id: 1, boardId, name: 'To Do', order: 0, createdAt: new Date() },
      { id: 2, boardId, name: 'In Progress', order: 1, createdAt: new Date() },
      { id: 3, boardId, name: 'Done', order: 2, createdAt: new Date() }
    ];
    
    // In a real app, you would fetch columns from API
    dispatch(setColumns(mockColumns));
    dispatch(setLoading(false));
    return mockColumns;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const fetchTasks = (columnId: number) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Mock tasks for now that match the schema
    const mockTasks = Array.from({ length: 3 }).map((_, i) => ({
      id: columnId * 100 + i,
      title: `Task ${i + 1} in column ${columnId}`,
      description: `This is a mock task ${i + 1} in column ${columnId}`,
      columnId,
      order: i,
      assigneeId: null,
      dueDate: null,
      priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
      category: i === 0 ? 'feature' : i === 1 ? 'bug' : 'ui',
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    // In a real app, you would fetch tasks from API
    dispatch(setTasks({ columnId, tasks: mockTasks }));
    dispatch(setLoading(false));
    return mockTasks;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const createColumn = (columnData: any) => (dispatch: any) => {
  // In a real application, you would make an API call here
  const newColumn = {
    ...columnData,
    id: Date.now(),
    createdAt: new Date()
  };
  
  dispatch(addColumn(newColumn));
  return newColumn;
};

export const fetchBoard = (boardId: number) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Mock board data for now that matches the schema
    const mockBoard = {
      id: boardId,
      name: `Board ${boardId}`,
      workspaceId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real app, you would fetch board from API
    dispatch(setCurrentBoard(mockBoard));
    
    // Get columns and tasks
    await dispatch(fetchColumns(boardId));
    
    const mockColumns = [1, 2, 3]; // placeholder column IDs from fetchColumns
    await Promise.all(mockColumns.map(columnId => dispatch(fetchTasks(columnId))));
    
    dispatch(setLoading(false));
    return mockBoard;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

// Alias for clearBoardState to maintain compatibility
export const clearBoard = clearBoardState;

export default boardSlice.reducer;