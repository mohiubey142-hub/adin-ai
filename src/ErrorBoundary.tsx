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
            // ✅ Background color matched with CVBuilder (bg-slate-100)
            background: "#f1f5f9", 
            color: "#0f172a", // Slate-900 text
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Icon / Graphic (Optional but looks premium) */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "24px",
              marginBottom: "8px",
              boxShadow: "0 10px 20px rgba(124, 58, 237, 0.2)"
            }}
          >
            !
          </div>

          <p style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
            Something went wrong
          </p>
          
          <p style={{ fontSize: "14px", color: "#475569", maxWidth: "340px", lineHeight: "1.5", margin: 0 }}>
            We encountered a small issue while loading Adin AI. Please tap below to reload. If the problem persists, try clearing your browser cache.
          </p>

          <button
            onClick={this.handleReload}
            style={{
              marginTop: "8px",
              padding: "10px 24px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              color: "#fff",
              border: "none",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}