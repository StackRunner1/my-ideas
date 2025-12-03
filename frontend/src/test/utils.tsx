/**
 * Test utilities for rendering components with providers
 *
 * Provides a custom render function that wraps components with necessary
 * context providers (Redux, Router, React Query).
 */

import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "../store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Don't retry in tests
    },
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

/**
 * Custom render function that wraps components with all necessary providers
 *
 * @example
 * ```typescript
 * test('renders button', () => {
 *   renderWithProviders(<Button>Click me</Button>);
 *   expect(screen.getByText('Click me')).toBeInTheDocument();
 * });
 * ```
 */
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { renderWithProviders };
