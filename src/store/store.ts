import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import session from "./sessionSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      session,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
