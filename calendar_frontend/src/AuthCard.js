import React from "react";

/**
 * PUBLIC_INTERFACE
 * AuthCard: Shared layout wrapper for authentication UI forms (login, register).
 * Implements centered card layout, elevation, padding, spacing.
 * Accepts children, optional header, accent color props.
 */
function AuthCard({ title, subtitle, children, accent, ...props }) {
  return (
    <div
      className="auth-card"
      style={{
        background: "#fff",
        boxShadow: "0 6px 32px -4px #176cae1d, 0 1.5px 7px 0 #2466a94d",
        borderRadius: "15px",
        width: "100%",
        maxWidth: 360,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        padding: "2.6em 2.2em 1.8em 2.2em",
        margin: "0 auto",
        gap: "1.3em",
        position: "relative",
        ...props.style,
      }}
      {...props}
    >
      {title && (
        <h2
          style={{
            margin: 0,
            marginBottom: "0.13em",
            fontWeight: 700,
            color: accent || "var(--header-bg)",
            letterSpacing: ".01em",
            fontSize: "1.47em",
            textAlign: "center",
          }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <div
          style={{
            color: "#607093",
            fontSize: "1em",
            textAlign: "center",
            marginBottom: "0.3em",
            fontWeight: 400,
            letterSpacing: ".01em",
          }}
        >
          {subtitle}
        </div>
      )}
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
}

export default AuthCard;
