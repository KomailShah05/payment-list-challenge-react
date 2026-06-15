import { I18N } from "./constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaymentsPage } from "./pages/PaymentsPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { initQueryObservability } from "./observability/queryObservability";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      // Keep cache alive for 30 min so returning to the tab after a break
      // doesn't discard previously loaded data.
      gcTime: 30 * 60 * 1000,
      // Don't refetch just because the user switches tabs — data stays fresh
      // for staleTime already; active navigation and search trigger new fetches.
      refetchOnWindowFocus: false,
    },
  },
});

// Cache hit rate, fetch durations and query failures → telemetry
initQueryObservability(queryClient);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">{I18N.APP_TITLE}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <PaymentsPage />
        </ErrorBoundary>
      </main>
    </div>
  </QueryClientProvider>
);

export default App;
