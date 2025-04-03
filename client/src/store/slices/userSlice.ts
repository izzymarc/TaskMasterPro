import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import { auth, signInWithGoogle, logOut } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User, Workspace, Team } from '@shared/schema';

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
  error: null,
};

// Async thunks
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: number) => {
    const response = await apiRequest('GET', `/api/users/${userId}`);
    return await response.json();
  }
);

export const fetchWorkspaces = createAsyncThunk(
  'user/fetchWorkspaces',
  async (userId: number) => {
    const response = await apiRequest('GET', `/api/workspaces?userId=${userId}`);
    return await response.json();
  }
);

export const fetchTeams = createAsyncThunk(
  'user/fetchTeams',
  async (workspaceId: number) => {
    const response = await apiRequest('GET', `/api/workspaces/${workspaceId}/teams`);
    return await response.json();
  }
);

export const createWorkspace = createAsyncThunk(
  'user/createWorkspace',
  async (workspace: { name: string; ownerId: number }) => {
    const response = await apiRequest('POST', '/api/workspaces', workspace);
    return await response.json();
  }
);

export const createTeam = createAsyncThunk(
  'user/createTeam',
  async (team: { name: string; workspaceId: number }) => {
    const response = await apiRequest('POST', '/api/teams', team);
    return await response.json();
  }
);

export const loginWithGoogle = createAsyncThunk(
  'user/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const firebaseUser = await signInWithGoogle();
      // Use the Firebase user to create or get the actual user from your backend
      // This is a simplified version - in a real app, you'd call your backend API
      return {
        id: 1, // In a real app, this would come from your backend
        username: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || undefined,
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const logout = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logOut();
      return null;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user';
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.workspaces = action.payload;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.teams = action.payload;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.workspaces.push(action.payload);
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload);
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
        state.workspaces = [];
        state.teams = [];
      });
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
