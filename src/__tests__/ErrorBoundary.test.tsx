import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ErrorBoundary from "../components/ErrorBoundary";

// A component that throws on render
const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error("Test explosion");
  return <div>Safe content</div>;
};

describe("ErrorBoundary", () => {
  // Suppress console.error noise for expected throws in jsdom
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  test("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  test("renders default fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test("renders Try again button in the default fallback", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  test("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<p>Custom error UI</p>}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("clicking Try again resets the error state when children no longer throw", () => {
    // Use a ref-like object to control throwing from outside
    let shouldThrow = true;
    const Controllable = () => {
      if (shouldThrow) throw new Error("Controllable boom");
      return <div>Recovered</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <Controllable />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Stop the child from throwing, then click Try again
    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    // Trigger a re-render so React runs the non-throwing child
    rerender(
      <ErrorBoundary>
        <Controllable />
      </ErrorBoundary>
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Recovered")).toBeInTheDocument();
  });
});
