import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "@/types";

interface SessionState {
  role: Role;
  userName: string;
}

const initialState: SessionState = {
  role: "manager",
  userName: "Alex Morgan",
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    roleChanged(state, action: PayloadAction<Role>) {
      state.role = action.payload;
    },
  },
});

export const { roleChanged } = sessionSlice.actions;
export default sessionSlice.reducer;
