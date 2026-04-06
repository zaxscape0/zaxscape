"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h2 style={{ color: "#ef4444" }}>Page Error</h2>
      <pre style={{ color: "#ef4444", whiteSpace: "pre-wrap" }}>{error.message}</pre>
      <pre style={{ color: "#888", fontSize: 11, marginTop: 8 }}>{error.stack}</pre>
      <button onClick={() => reset()} style={{ marginTop: 12, padding: "6px 12px" }}>
        Retry
      </button>
    </div>
  );
}
