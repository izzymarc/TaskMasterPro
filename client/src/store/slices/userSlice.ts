import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, Team, Workspace } from '@shared/schema';
import { logOut as firebaseLogout } from '@/lib/firebase';

interface UserState {
  currentUser: User | null;
  workspaces: Workspace[];
  teams: Team[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  workspaces: [],
  teams: [],
  loading: false,
  error: null
};

// Helper function to convert Date objects to ISO strings for Redux
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

export const logout = createAsyncThunk('user/logout', async () => {
  await firebaseLogout();
  return null;
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = serializeDates(action.payload);
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.workspaces = [];
      state.teams = [];
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      state.workspaces = action.payload.map(workspace => serializeDates(workspace));
    },
    setTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload.map(team => serializeDates(team));
    },
    addWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspaces.push(serializeDates(action.payload));
    },
    addTeam: (state, action: PayloadAction<Team>) => {
      state.teams.push(serializeDates(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
        state.loading = false;
        state.workspaces = [];
        state.teams = [];
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to log out';
      });
  }
});

export const { 
  setUser,
  clearUser,
  setLoading, 
  setError, 
  setWorkspaces, 
  setTeams,
  addWorkspace,
  addTeam
} = userSlice.actions;

export default userSlice.reducer;