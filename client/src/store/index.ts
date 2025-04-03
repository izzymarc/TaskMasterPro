import { configureStore } from '@reduxjs/toolkit';
import boardReducer from './slices/boardSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    board: boardReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['board/setBoard', 'board/moveTask'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.dueDate', 'payload.createdAt', 'payload.updatedAt'],
        // Ignore these paths in the state
        ignoredPaths: [
          'board.tasks.dueDate',
          'board.tasks.createdAt',
          'board.tasks.updatedAt',
          'board.columns',
          'board.tasks',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
