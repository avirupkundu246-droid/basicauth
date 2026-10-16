import { useEffect, useState } from "react";
import "./App.css";

const API = "https://basicauth-h1xm.onrender.com";

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  required = true,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label htmlFor={id}>
      {label}
      <div className="password-input-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
        />
        <button
          type="button"
          className="eye-button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
              <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 9 5.2 9 7a9.8 9.8 0 01-3.1 4.3M6.2 6.2C3.9 7.7 3 10.1 3 12c0 1.8 3.8 7 9 7a10.2 10.2 0 003.3-.6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </label>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("auth-theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("auth-theme", theme);
    } catch {
      // The app still works if browser storage is unavailable.
    }
  }, [theme]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  }

  async function loadProfile() {
    try {
      const data = await request("/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function updateForm(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function showError(text) {
    setError(text);
    setMessage("");
  }

  function showMessage(text) {
    setMessage(text);
    setError("");
  }

  async function handleAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const path = mode === "register" ? "/register" : "/login";
      const body =
        mode === "register"
          ? form
          : { email: form.email, password: form.password };

      const data = await request(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (mode === "register") {
        showMessage("Account created! Please log in.");
        setMode("login");
        setForm({
          name: "",
          email: form.email,
          password: "",
          phone: "",
        });
      } else {
        setUser(data.user);
        setActiveSection("profile");
        showMessage("Welcome back!");
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateProfile(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const data = await request("/me", {
        method: "PUT",
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
        }),
      });

      setUser(data.user);
      showMessage(data.message || "Profile updated successfully!");
    } catch (err) {
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const data = await request("/change-password", {
        method: "PUT",
        body: JSON.stringify(passwordForm),
      });

      setPasswordForm({ currentPassword: "", newPassword: "" });
      showMessage(data.message || "Password changed successfully!");
    } catch (err) {
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);

    try {
      const data = await request("/logout", { method: "POST" });
      setUser(null);
      setForm({ name: "", email: "", password: "", phone: "" });
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setMode("login");
      setProfileMenuOpen(false);
      setActiveSection("profile");
      showMessage(data.message || "Logged out successfully.");
    } catch (err) {
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function chooseSection(section) {
    setActiveSection(section);
    setProfileMenuOpen(false);
    setError("");
    setMessage("");
  }

  if (loading) {
    return <main className="loading">Loading your account...</main>;
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <header className="topbar">
        <a className="brand" href="#" onClick={(event) => event.preventDefault()} aria-label="Authentication System home">
          <span className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          </span>
          <span>Authentication System</span>
        </a>
        <div className="topbar-actions">
          <span className="topbar-label">{user ? "ACCOUNT MANAGEMENT" : "SECURE ACCOUNT ACCESS"}</span>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
            )}
            <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </button>
        </div>

        {user ? (
          <div className="profile-menu-wrap">
            <button
              type="button"
              className="profile-trigger"
              aria-expanded={profileMenuOpen}
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              <span className="profile-avatar">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </span>
              <span className="profile-trigger-name">
                <strong>{user.name || "My account"}</strong>
                <small>Account settings</small>
              </span>
              <svg className="chevron-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d={profileMenuOpen ? "m6 14 6-6 6 6" : "m6 9 6 6 6-6"} />
              </svg>
            </button>

            {profileMenuOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-user">
                  <strong>{user.name || "User"}</strong>
                  <span>{user.email}</span>
                </div>
                <button
                  type="button"
                  className={activeSection === "profile" ? "dropdown-item active" : "dropdown-item"}
                  onClick={() => chooseSection("profile")}
                >
                  <span className="dropdown-symbol">◎</span>
                  My Profile
                </button>
                <button
                  type="button"
                  className={activeSection === "password" ? "dropdown-item active" : "dropdown-item"}
                  onClick={() => chooseSection("password")}
                >
                  <span className="dropdown-symbol">⌑</span>
                  Change Password
                </button>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  className="dropdown-item logout-option"
                  onClick={logout}
                  disabled={busy}
                >
                  <span className="dropdown-symbol">↗</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : null}
      </header>

      <section className="page-content">
        {!user ? (
          <div className="auth-layout">
            <div className="intro">
              <span className="eyebrow">YOUR ACCOUNT, YOUR CONTROL</span>
              <h1>
                A simpler way to
                <span> manage your account.</span>
              </h1>
              <p>
                Create your account, securely sign in, and manage your personal
                details in one place.
              </p>
              <div className="benefit">
                <span>✓</span> Secure password handling
              </div>
              <div className="benefit">
                <span>✓</span> Personal profile management
              </div>
              <div className="benefit">
                <span>✓</span> Account security settings
              </div>
            </div>

            <div className="panel auth-panel">
              <div className="panel-heading">
                <span className="eyebrow">
                  {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
                </span>
                <h2>
                  {mode === "login"
                    ? "Sign in to your account"
                    : "Create your account"}
                </h2>
                <p>
                  {mode === "login"
                    ? "Enter your credentials to continue."
                    : "Fill in your details to get started."}
                </p>
              </div>

              {error && <div className="notice error" role="alert">{error}</div>}
              {message && <div className="notice success" role="status">{message}</div>}

              <form onSubmit={handleAuth}>
                {mode === "register" && (
                  <label htmlFor="register-name">
                    Full name
                    <input
                      id="register-name"
                      name="name"
                      value={form.name}
                      onChange={updateForm}
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                    />
                  </label>
                )}

                <label htmlFor="auth-email">
                  Email address
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateForm}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>

                <PasswordInput
                  id="auth-password"
                  label="Password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={mode === "register" ? 8 : undefined}
                />

                {mode === "register" && (
                  <label htmlFor="register-phone">
                    Phone number <span className="optional">(optional)</span>
                    <input
                      id="register-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={updateForm}
                      placeholder="Your phone number"
                      autoComplete="tel"
                    />
                  </label>
                )}

                <button className="primary-button" disabled={busy} type="submit">
                  {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
                  {!busy && <span>→</span>}
                </button>
              </form>

              <p className="switch-mode">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                    setMessage("");
                  }}
                >
                  {mode === "login" ? "Create one" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="dashboard">
            <div className="dashboard-heading">
              <div>
                <span className="eyebrow">YOUR ACCOUNT</span>
                <h1>{activeSection === "profile" ? "Account dashboard" : "Security settings"}</h1>
                <p>
                  {activeSection === "profile"
                    ? "Manage your personal information and account details."
                    : "Keep your account secure by updating your password."}
                </p>
              </div>
              <div className="current-section-pill">
                <span className="status-dot" />
                {activeSection === "profile" ? "My Profile" : "Change Password"}
              </div>
            </div>

            {error && <div className="notice error" role="alert">{error}</div>}
            {message && <div className="notice success" role="status">{message}</div>}

            <div className="dashboard-single">
              {activeSection === "profile" ? (
                <section className="panel dashboard-panel">
                  <div className="section-title">
                    <div className="section-icon">01</div>
                    <div>
                      <h2>Personal details</h2>
                      <p>Update the information associated with your account.</p>
                    </div>
                  </div>

                  <form onSubmit={updateProfile}>
                    <label htmlFor="profile-name">
                      Full name
                      <input
                        id="profile-name"
                        value={user.name || ""}
                        onChange={(event) => setUser({ ...user, name: event.target.value })}
                        autoComplete="name"
                        required
                      />
                    </label>
                    <label htmlFor="profile-email">
                      Email address
                      <input
                        id="profile-email"
                        type="email"
                        value={user.email || ""}
                        onChange={(event) => setUser({ ...user, email: event.target.value })}
                        autoComplete="email"
                        required
                      />
                    </label>
                    <label htmlFor="profile-phone">
                      Phone number <span className="optional">(optional)</span>
                      <input
                        id="profile-phone"
                        type="tel"
                        value={user.phone || ""}
                        onChange={(event) => setUser({ ...user, phone: event.target.value })}
                        autoComplete="tel"
                      />
                    </label>
                    <div className="form-actions">
                      <button className="primary-button" disabled={busy} type="submit">
                        {busy ? "Saving..." : "Save changes"} {!busy && <span>→</span>}
                      </button>
                    </div>
                  </form>
                </section>
              ) : (
                <section className="panel dashboard-panel">
                  <div className="section-title">
                    <div className="section-icon">02</div>
                    <div>
                      <h2>Change password</h2>
                      <p>Verify your current password before choosing a new one.</p>
                    </div>
                  </div>

                  <form onSubmit={changePassword}>
                    <PasswordInput
                      id="current-password"
                      label="Current password"
                      value={passwordForm.currentPassword}
                      onChange={(event) =>
                        setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
                      }
                      autoComplete="current-password"
                      placeholder="Enter current password"
                    />
                    <PasswordInput
                      id="new-password"
                      label="New password"
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        setPasswordForm({ ...passwordForm, newPassword: event.target.value })
                      }
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      minLength={8}
                    />
                    <p className="helper">
                      Use at least 8 characters. You’ll need your current password to make this change.
                    </p>
                    <div className="form-actions">
                      <button className="secondary-button" type="button" onClick={() => chooseSection("profile")}>
                        Cancel
                      </button>
                      <button className="primary-button" disabled={busy} type="submit">
                        {busy ? "Updating..." : "Update password"} {!busy && <span>→</span>}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </div>
          </div>
        )}
      </section>

      <footer className="footer">
        <span>AUTHENTICATION SYSTEM · ACCOUNT MANAGEMENT</span>
        <span>Built with React, Node.js & MongoDB</span>
      </footer>
    </main>
  );
}
