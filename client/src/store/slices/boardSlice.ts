import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Board, Column, Task as SchemaTask } from '@shared/schema';
import type { RootState, AppDispatch, AppThunk } from '@/store';

// Extended Task type with serialized dates for Redux
export type Task = Omit<SchemaTask, 'createdAt' | 'updatedAt' | 'dueDate'> & {
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  dueDate: Date | string | null;
};

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

// Helper to serialize dates for Redux storage
const serializeDates = (obj: any): any => {
  if (!obj) return obj;
  
  const result = { ...obj };
  
  Object.keys(result).forEach(key => {
    if (result[key] instanceof Date) {
      result[key] = result[key].toISOString();
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = serializeDates(result[key]);
    }
  });
  
  return result;
};

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setCurrentBoard: (state, action: PayloadAction<Board>) => {
      state.currentBoard = serializeDates(action.payload);
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
      id: number;
      columnId: number;
      order: number;
    }>) => {
      const { id, columnId, order } = action.payload;
      
      // Find the source column that contains the task
      let sourceColumnId: number | undefined;
      let sourceTaskIndex: number = -1;
      
      // Find the task in all columns
      Object.entries(state.tasks).forEach(([colId, tasks]) => {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
          sourceColumnId = Number(colId);
          sourceTaskIndex = taskIndex;
        }
      });
      
      if (sourceColumnId !== undefined && sourceTaskIndex !== -1) {
        // Copy the task
        const movedTask = state.tasks[sourceColumnId][sourceTaskIndex];
        
        // Remove from source column
        state.tasks[sourceColumnId] = state.tasks[sourceColumnId].filter(task => task.id !== id);
        
        // Update task column ID and order
        const updatedTask = { ...movedTask, columnId, order };
        
        // Ensure destination column tasks array exists
        if (!state.tasks[columnId]) {
          state.tasks[columnId] = [];
        }
        
        // Add to destination column
        state.tasks[columnId].push(updatedTask);
        
        // Sort tasks by order
        state.tasks[columnId].sort((a, b) => a.order - b.order);
        
        // Update order of all tasks in both columns
        state.tasks[sourceColumnId] = state.tasks[sourceColumnId].map((task, index) => ({
          ...task,
          order: index
        }));
        
        state.tasks[columnId] = state.tasks[columnId].map((task, index) => ({
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
  updateColumn, // Keep this for direct reducer calls
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

// Async actions for board operations with Firebase integration
import { 
  db, 
  createDocument, 
  getDocuments, 
  getDocument, 
  updateDocument, 
  deleteDocument, 
  subscribeToCollection 
} from '@/lib/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

// Helper to convert Firestore date objects
const convertFirebaseTimestamps = (obj: any) => {
  if (!obj) return obj;
  const newObj = { ...obj };
  
  // Convert timestamp fields to Date objects
  if (newObj.createdAt && typeof newObj.createdAt.toDate === 'function') {
    newObj.createdAt = newObj.createdAt.toDate();
  }
  if (newObj.updatedAt && typeof newObj.updatedAt.toDate === 'function') {
    newObj.updatedAt = newObj.updatedAt.toDate();
  }
  if (newObj.dueDate && typeof newObj.dueDate.toDate === 'function') {
    newObj.dueDate = newObj.dueDate.toDate();
  }
  
  return newObj;
};

export const createTask = (taskData: any): AppThunk<Promise<Task>> => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Process dates - Convert Date objects to ISO strings for serialization
    const processedTaskData = { ...taskData };
    if (processedTaskData.dueDate instanceof Date) {
      processedTaskData.dueDate = processedTaskData.dueDate.toISOString();
    }
    
    // Generate a timestamp-based ID
    const taskId = Date.now();
    
    // Create task with string dates for Redux serialization
    const newTask = {
      ...processedTaskData,
      id: taskId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Create the task in Firebase - serialize all dates
    await createDocument('tasks', taskId.toString(), serializeDates(newTask));
    
    // Update local state with serialized task
    dispatch(addTask({ 
      columnId: newTask.columnId, 
      task: newTask
    }));
    
    dispatch(setLoading(false));
    return newTask;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const fetchColumns = (boardId: number) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Query columns for this board from Firebase
    const columns = await getDocuments('columns');
    
    // Filter columns by boardId and convert any Firebase timestamps
    const boardColumns = columns
      .filter((col: any) => col.boardId === boardId)
      .map(convertFirebaseTimestamps)
      .sort((a: any, b: any) => a.order - b.order);
    
    // In case no columns exist yet, create default columns
    if (boardColumns.length === 0) {
      const defaultColumns = [
        { id: Date.now(), boardId, name: 'To Do', order: 0, createdAt: new Date() },
        { id: Date.now() + 1, boardId, name: 'In Progress', order: 1, createdAt: new Date() },
        { id: Date.now() + 2, boardId, name: 'Done', order: 2, createdAt: new Date() }
      ];
      
      // Save default columns to Firebase
      await Promise.all(
        defaultColumns.map(col => 
          createDocument('columns', col.id.toString(), col)
        )
      );
      
      dispatch(setColumns(defaultColumns));
    } else {
      dispatch(setColumns(boardColumns));
    }
    
    dispatch(setLoading(false));
    return boardColumns;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const fetchTasks = (columnId: number) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Query tasks for this column from Firebase
    const tasks = await getDocuments('tasks');
    
    // Filter tasks by columnId and convert any Firebase timestamps
    const columnTasks = tasks
      .filter((task: any) => task.columnId === columnId)
      .map(convertFirebaseTimestamps)
      .sort((a: any, b: any) => a.order - b.order);
    
    dispatch(setTasks({ columnId, tasks: columnTasks }));
    dispatch(setLoading(false));
    return columnTasks;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const createColumn = (columnData: any) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    const newColumn = {
      ...columnData,
      id: Date.now(),
      createdAt: new Date()
    };
    
    // Create the column in Firebase
    await createDocument('columns', newColumn.id.toString(), newColumn);
    
    // Update local state
    dispatch(addColumn(newColumn));
    
    dispatch(setLoading(false));
    return newColumn;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const updateColumnAction = (columnData: any) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    const updatedColumn = {
      ...columnData,
      updatedAt: new Date()
    };
    
    // Update the column in Firebase
    await updateDocument('columns', updatedColumn.id.toString(), updatedColumn);
    
    // Update local state
    dispatch(boardSlice.actions.updateColumn(updatedColumn));
    
    dispatch(setLoading(false));
    return updatedColumn;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const updateTaskAction = (taskData: Task): AppThunk<Promise<Task>> => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Process dates for serialization
    const processedTaskData = { ...taskData };
    if (processedTaskData.dueDate instanceof Date) {
      processedTaskData.dueDate = processedTaskData.dueDate.toISOString();
    }
    
    const updatedTask = {
      ...processedTaskData,
      updatedAt: new Date().toISOString()
    };
    
    // Update the task in Firebase with serialized dates
    await updateDocument('tasks', updatedTask.id.toString(), serializeDates(updatedTask));
    
    // Update local state with serialized task
    dispatch(updateTask(updatedTask));
    
    dispatch(setLoading(false));
    return updatedTask;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const deleteTaskAction = (payload: { columnId: number, taskId: number }): AppThunk<Promise<boolean>> => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Delete the task in Firebase
    await deleteDocument('tasks', payload.taskId.toString());
    
    // Update local state
    dispatch(removeTask(payload));
    
    dispatch(setLoading(false));
    return true;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const deleteColumnAction = (columnId: number): AppThunk<Promise<boolean>> => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Delete the column in Firebase
    await deleteDocument('columns', columnId.toString());
    
    // Also delete all tasks in this column
    const tasks = await getDocuments('tasks');
    const columnTasks = tasks.filter((task: any) => task.columnId === columnId);
    
    await Promise.all(
      columnTasks.map((task: any) => 
        deleteDocument('tasks', task.id.toString())
      )
    );
    
    // Update local state
    dispatch(removeColumn(columnId));
    
    dispatch(setLoading(false));
    return true;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const moveTaskAction = (payload: { id: number; columnId: number; order: number }): AppThunk<Promise<boolean>> => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Get the task from Firebase
    const taskData = await getDocument('tasks', payload.id.toString());
    
    if (taskData) {
      // Cast taskData to any first to avoid TypeScript errors
      const task = taskData as any;
      
      // Create a properly typed task object with serialized dates
      const updatedTask: Task = {
        id: task.id,
        title: task.title || '',
        description: task.description || null,
        columnId: payload.columnId,
        order: payload.order,
        assigneeId: task.assigneeId || null,
        priority: task.priority || 'medium',
        category: task.category || 'feature',
        isCompleted: task.isCompleted || false,
        createdAt: task.createdAt ? (task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt) : null,
        updatedAt: new Date().toISOString(),
        dueDate: task.dueDate ? (task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate) : null
      };
      
      // Update the task in Firebase with serialized dates
      await updateDocument('tasks', updatedTask.id.toString(), serializeDates(updatedTask));
      
      // Update local state
      dispatch(moveTask(payload));
    }
    
    dispatch(setLoading(false));
    return true;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const fetchBoard = (boardId: number) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Try to get the board from Firebase
    let board;
    try {
      board = await getDocument('boards', boardId.toString());
    } catch (error) {
      console.log('Board not found, creating a default board...');
    }
    
    // If board doesn't exist, create a default one
    if (!board) {
      board = {
        id: boardId,
        name: `Board ${boardId}`,
        workspaceId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save the default board to Firebase
      await createDocument('boards', boardId.toString(), board);
    }
    
    // Convert any Firebase timestamps
    board = convertFirebaseTimestamps(board);
    
    // Update local state
    dispatch(setCurrentBoard(board));
    
    // Get columns for this board
    await dispatch(fetchColumns(boardId));
    
    // Get tasks for each column
    const columns = await getDocuments('columns');
    const boardColumns = columns.filter((col: any) => col.boardId === boardId);
    
    await Promise.all(
      boardColumns.map((column: any) => dispatch(fetchTasks(column.id)))
    );
    
    dispatch(setLoading(false));
    return board;
  } catch (error) {
    dispatch(setError((error as Error).message));
    dispatch(setLoading(false));
    throw error;
  }
};

// Alias for clearBoardState to maintain compatibility
export const clearBoard = clearBoardState;

export default boardSlice.reducer;