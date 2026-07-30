import React from "react";

// ✅ INSTAGRAM WEBVIEW FIX: App-level Error Boundary
// Without this, ANY uncaught JS error anywhere in the tree (storage blocked,
// a third-party script failing, etc.) causes React to unmount the entire
// app, which is exactly what looked like a "black screen" inside Instagram's
// in-app browser. This boundary catches that error and shows a safe retry
// screen instead of a blank page, and it never touches SEO, PWA, or any
// existing UI/AI logic.
type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Log only — never break silently without a trace
    console.error("App crashed, boundary caught it:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "24px",
            textAlign: "center",
            background: "#0a0a0a",
            color: "#fff",
            fontFamily: "sans-serif",
          }}
        >
          <p style={{ fontSize: "18px", fontWeight: 600 }}>
            Something went wrong loading Adin AI.
          </p>
          <p style={{ fontSize: "14px", opacity: 0.7, maxWidth: 320 }}>
            Please tap below to reload. If you opened this from Instagram,
            try opening it in your regular browser (Chrome/Safari) instead.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#8b5cf6",
              color: "#fff",
              border: "none",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
