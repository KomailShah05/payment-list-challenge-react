import { I18N } from "./constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaymentsPage } from "./pages/PaymentsPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { initQueryObservability } from "./observability/queryObservability";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
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
