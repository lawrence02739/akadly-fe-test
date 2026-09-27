import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isOwner?: boolean;
  roles?: string[];
  permissions?: string[];
  paymentStatus?: "due" | "paid" | "unpaid";
  dueDate?: string | null;
  isReadOnly?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

const storedUser = localStorage.getItem("user");
let parsedUser: AuthUser | null = null;
try {
  parsedUser = storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
} catch {
  localStorage.removeItem("user");
}

const initialState: AuthState = {
  isAuthenticated: !!parsedUser,
  user: parsedUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: AuthUser }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("user");
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
