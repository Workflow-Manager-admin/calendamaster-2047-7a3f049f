import React, { useState } from "react";
import AuthCard from "./AuthCard";

/**
 * PUBLIC_INTERFACE
 * Registration form for new users. Now uses shared AuthCard.
 */
function RegisterForm({ onRegister, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Email and password required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await onRegister(email, password);
      setSuccess("Registration successful! You may now log in.");
    } catch (err) {
      setError(
        err?.message ||
          "Registration failed. Please try a different email or password."
      );
    }
  };

  return (
    <AuthCard title="Register" subtitle="Create your free account">
      <form
        className="auth-form-v2"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1em",
        }}
        onSubmit={handleSubmit}
        autoComplete="on"
      >
        <label className="auth-label">
          <span className="auth-label-text">Email</span>
          <input
            className="auth-input"
            type="email"
            value={email}
            autoComplete="username"
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </label>
        <label className="auth-label">
          <span className="auth-label-text">Password</span>
          <input
            className="auth-input"
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="New password"
          />
        </label>
        <label className="auth-label">
          <span className="auth-label-text">Repeat Password</span>
          <input
            className="auth-input"
            type="password"
            value={repeatPassword}
            autoComplete="new-password"
            onChange={e => setRepeatPassword(e.target.value)}
            required
            placeholder="Repeat password"
          />
        </label>
        {error && (
          <div className="auth-error" style={{ marginBottom: "0.2em" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ color: "#357a38", margin: "0.3em 0 0.6em", textAlign: "center" }}>
            {success}
          </div>
        )}
        <button
          type="submit"
          className="btn-primary auth-btn"
          style={{
            width: "100%",
            marginTop: "0.2em",
            padding: "10px 0",
            borderRadius: "7px",
            fontWeight: 700,
            fontSize: "1.08em",
            boxShadow: "0 1.5px 15px 0 #1976d212",
            letterSpacing: ".02em",
          }}
        >
          Register
        </button>
        <div
          style={{
            marginTop: "0.7em",
            fontSize: "0.98em",
            textAlign: "center",
          }}
        >
          <span style={{ color: "#263b54" }}>Already have an account?</span>{" "}
          <button
            type="button"
            className="auth-link"
            style={{
              color: "var(--header-bg)",
              background: "none",
              border: "none",
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "1em",
              marginLeft: "2px",
              padding: 0,
            }}
            onClick={onSwitchToLogin}
          >
            Login
          </button>
        </div>
      </form>
    </AuthCard>
  );
}

export default RegisterForm;
