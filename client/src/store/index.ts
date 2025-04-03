import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import boardReducer from './slices/boardSlice';

// Helper function to serialize dates to ISO strings during state transformations
const dateSerializer = {
  replacer: (key: string, value: any) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }
};

export const store = configureStore({
  reducer: {
    user: userReducer,
    board: boardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'payload.0.createdAt', 'payload.0.updatedAt'],
        ignoredPaths: ['user.currentUser.createdAt', 'user.currentUser.updatedAt', 'user.workspaces.createdAt', 'user.workspaces.updatedAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;