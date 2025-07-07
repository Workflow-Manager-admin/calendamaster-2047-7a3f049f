import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Registration form for new users.
 * Allows a new user to register by providing email and password.
 * Calls onRegister(email, password) prop on submit.
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

    // Simple validation
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
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <label>
        Email
        <input
          type="email"
          value={email}
          autoComplete="username"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <label>
        Repeat Password
        <input
          type="password"
          value={repeatPassword}
          autoComplete="new-password"
          onChange={(e) => setRepeatPassword(e.target.value)}
          required
        />
      </label>
      {error && <div className="auth-error">{error}</div>}
      {success && (
        <div style={{ color: "#357a38", marginBottom: "0.6em" }}>{success}</div>
      )}
      <button type="submit" className="btn-primary">
        Register
      </button>
      <button
        type="button"
        style={{ marginTop: "0.7em", background: "none", border: "none", color: "#1976d2", textDecoration: "underline", cursor: "pointer" }}
        onClick={onSwitchToLogin}
      >
        Back to Login
      </button>
    </form>
  );
}

export default RegisterForm;
