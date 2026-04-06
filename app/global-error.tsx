"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ background: "#0a0a0a", color: "#e2e2e2", fontFamily: "monospace", padding: 40 }}>
        <h1>Something went wrong</h1>
        <pre style={{ color: "#ef4444", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {error.message}
        </pre>
        <pre style={{ color: "#888", fontSize: 12, marginTop: 16, whiteSpace: "pre-wrap" }}>
          {error.stack}
        </pre>
        <button
          onClick={() => reset()}
          style={{
            marginTop: 20,
            padding: "8px 16px",
            background: "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
