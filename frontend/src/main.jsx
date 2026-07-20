import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import App from "./App.jsx";
import ErrorBoundary from "./pages/ErrorBoundary.jsx";
import { applyA11yPrefs } from "./services/accessibility.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";

applyA11yPrefs();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error?.status === 401 || error?.status === 404) return false;
        return failureCount < 2;
      },
      staleTime: 30 * 1000
    }
  }
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
      <RadixTooltip.Provider delayDuration={300}>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <NotificationProvider>
              <ErrorBoundary><App /></ErrorBoundary>
            </NotificationProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
      </RadixTooltip.Provider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
