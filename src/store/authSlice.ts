import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import apiService from '../services';
import config from '../config';
import { LoginRequest, RegisterRequest, AuthUser } from '../types';

// Define the auth state interface
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Check if there is a token in localStorage
const token = localStorage.getItem(config.auth.tokenKey);
if (token) {
  try {
    // Decode the token to get user info
    const decodedToken: any = jwtDecode(token);
    
    // Check if the token is expired
    const isExpired = decodedToken.exp * 1000 < Date.now();
    
    if (!isExpired) {
      initialState.user = {
        id: decodedToken.sub || '',
        email: decodedToken.email || '',
        name: decodedToken.name || '',
        role: decodedToken.role || 'employee',
        token,
      };
      initialState.isAuthenticated = true;
    } else {
      // Remove expired token
      localStorage.removeItem(config.auth.tokenKey);
    }
  } catch (error) {
    // Invalid token
    localStorage.removeItem(config.auth.tokenKey);
  }
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const user = await apiService.auth.login(credentials);
      
      // Save token to localStorage
      localStorage.setItem(config.auth.tokenKey, user.token);
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to login');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const user = await apiService.auth.register(userData);
      
      // Save token to localStorage
      localStorage.setItem(config.auth.tokenKey, user.token);
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to register');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.auth.logout();
      
      // Remove token from localStorage
      localStorage.removeItem(config.auth.tokenKey);
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to logout');
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Logout
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer; 