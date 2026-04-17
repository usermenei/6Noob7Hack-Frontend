"use client";

import { store } from "@/redux/store";
import { Provider as ReactReduxProvider } from "react-redux";

// redux-persist is no longer needed since reservations are stored in the real backend.
// If you add new persisted slices in the future, you can re-add it.

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactReduxProvider store={store}>
      {children}
    </ReactReduxProvider>
  );
}
