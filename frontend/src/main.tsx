import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./store";
import { AppRoutes } from "./routes/AppRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SkipLink } from "./lib/accessibility";
import { Toaster } from "sonner";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SkipLink />
            <div id="main-content">
              <AppRoutes />
            </div>
            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </QueryClientProvider>
      </ReduxProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
