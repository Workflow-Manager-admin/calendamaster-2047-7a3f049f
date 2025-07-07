import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import RegisterForm from "./RegisterForm";

/** 
 * PUBLIC_INTERFACE
 * Calendar Application root component.
 * Implements authentication, sidebar (categories), main panel for calendar,
 * modals for event management, navigation bar, color coding, and responsive layout,
 * with all states managed in the frontend and backend API integrations indicated.
 */
const COLORS = {
  primary: "#1976d2",
  secondary: "#424242",
  accent: "#ffca28",
  ...{
    // Category color presets for event types
    "Work": "#1976d2",
    "Personal": "#ffca28",
    "Family": "#e57373",
    "Health": "#43a047",
    "Other": "#9e9e9e"
  }
};

// Sample category set (can be loaded from backend)
const defaultCategories = [
  { id: 1, name: "Work", color: COLORS["Work"] },
  { id: 2, name: "Personal", color: COLORS["Personal"] },
  { id: 3, name: "Family", color: COLORS["Family"] },
  { id: 4, name: "Health", color: COLORS["Health"] },
  { id: 5, name: "Other", color: COLORS["Other"] }
];

// Sample events (replace with backend API load)
const SAMPLE_EVENTS = [
  {
    id: 1,
    title: "Team Meeting",
    start: new Date().toISOString().split("T")[0] + "T11:00",
    end: new Date().toISOString().split("T")[0] + "T12:00",
    category: "Work",
    description: "Weekly sync with project team.",
  },
  {
    id: 2,
    title: "Dentist Appointment",
    start: new Date().toISOString().split("T")[0] + "T16:00",
    end: new Date().toISOString().split("T")[0] + "T17:00",
    category: "Health",
    description: "Routine cleaning",
  },
];

// --- Authentication Context ---

const AuthContext = React.createContext();

// PUBLIC_INTERFACE
function AuthProvider({ children }) {
  /**
   * Provide authentication state and methods.
   * In a real implementation, connect to backend API for login/register/logout.
   */
  const [user, setUser] = useState(null);

  // Backend API Base
  // API backend base configuration: allow override with REACT_APP_API_URL (preferred -- see README)
  // Default to backend service running at port 3001 on the same domain as frontend, else fall back to cloud URL as last resort
  const API_BASE =
    process.env.REACT_APP_API_URL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:3001"
      : "https://vscode-internal-149548-beta.beta01.cloud.kavia.ai:3001");

  /** PUBLIC_INTERFACE
   * Logs in a user by contacting backend endpoint /auth/token (OAuth2 password flow).
   * Throws error if credentials are invalid or network/connection fails.
   *
   * FastAPI expects: POST /auth/token with form-urlencoded data (grant_type=password, username, password).
   */
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        credentials:
          API_BASE.startsWith("http://localhost") ||
          API_BASE.startsWith("http://127.0.0.1") ||
          API_BASE.includes(window.location.hostname)
            ? "same-origin"
            : "include",
        body: new URLSearchParams({
          grant_type: "password",
          username: email,
          password
        }).toString(),
      });
      if (!res.ok) {
        // Try to extract error detail from backend if present
        let errMsg = "Invalid credentials";
        try {
          const errData = await res.json();
          errMsg = errData?.detail || errMsg;
        } catch (_e) {}
        throw new Error(errMsg);
      }
      // Backend returns: { access_token, token_type }
      const data = await res.json();
      // Optionally, store the JWT for later API calls
      // localStorage.setItem("token", data.access_token);
      setUser({ email }); // Set logged-in user
    } catch (err) {
      // Add more details for connection/network errors
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        throw new Error(
          "Could not connect to backend API. Please check your network connection or try again later."
        );
      }
      throw err;
    }
  };

  /** PUBLIC_INTERFACE
   * Logs out the user in frontend (local session only).
   */
  const logout = () => setUser(null);

  /** PUBLIC_INTERFACE
   * Registers a user with backend, expects email and password.
   * Throws error if registration fails (duplicate email, password rules, or network error).
   */
  const register = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials:
          API_BASE.startsWith("http://localhost") ||
          API_BASE.startsWith("http://127.0.0.1") ||
          API_BASE.includes(window.location.hostname)
            ? "same-origin"
            : "include",
        body: JSON.stringify({ username: email, password }),
      });
      if (res.ok) return true;
      let errData = {};
      try {
        errData = await res.json();
      } catch (_e) {}
      throw new Error(
        errData?.detail ||
          "Registration failed. Please try again with a different email."
      );
    } catch (err) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        throw new Error(
          "Could not contact backend API. Please check your network or backend service."
        );
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Modals ---

function Modal({ children, open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">&times;</button>
        {children}
      </div>
    </div>
  );
}

// --- Authentication Forms ---

// PUBLIC_INTERFACE
function LoginForm({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (email && password) {
      try {
        await onLogin(email, password);
      } catch (err) {
        setError(
          err?.message || "Login error. Please check credentials and try again."
        );
      }
    } else {
      setError("Email and password required");
    }
  };
  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
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
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <div className="auth-error">{error}</div>}
      <button type="submit" className="btn-primary">
        Login
      </button>
      <button
        type="button"
        style={{
          marginTop: "0.7em",
          background: "none",
          border: "none",
          color: "#1976d2",
          textDecoration: "underline",
          cursor: "pointer",
        }}
        onClick={onSwitchToRegister}
      >
        Register a new account
      </button>
    </form>
  );
}

// --- Navigation Bar ---

function NavBar({ user, onLogout, onThemeToggle, theme }) {
  return (
    <nav className="navbar">
      <div className="navbar-title">Calendamaster</div>
      <div className="navbar-right">
        <button onClick={onThemeToggle} className="theme-toggle-btn" aria-label="Toggle light/dark mode">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {user && <span className="navbar-user">{user.email}</span>}
        {user && <button onClick={onLogout} className="navbar-logout">Logout</button>}
      </div>
    </nav>
  );
}

// --- Sidebar for Categories ---

function Sidebar({ categories, selectedCategoryIds, onSelectCategory, onAdd, onEdit }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>Calendars</span>
        <button className="sidebar-add-btn" aria-label="Add category" onClick={onAdd}>+</button>
      </div>
      <ul className="sidebar-list">
        {categories.map(category => (
          <li
            key={category.id}
            className={`sidebar-item ${selectedCategoryIds.includes(category.id) ? "selected" : ""}`}
            style={{ "--category-color": category.color }}
            onClick={() => onSelectCategory(category.id)}
            title={category.name}
          >
            <span className="sidebar-color-bullet" style={{ backgroundColor: category.color }} />
            {category.name}
            <button className="sidebar-edit-btn" aria-label="Edit category" tabIndex={-1} onClick={e => { e.stopPropagation(); onEdit(category); }}>✎</button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// --- Calendar Views ---

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Returns: array of { date: '2023-12-14', isToday: bool, ... }
function computeMonthDays(year, month) {
  const days = [];
  const todayStr = new Date().toISOString().split("T")[0];
  const firstDay = new Date(year, month, 1).getDay();
  // Days of previous month to fill first week
  const prevMonthDays = (firstDay + 6) % 7;
  const prevMonthDate = new Date(year, month, 0);
  for (let d = prevMonthDate.getDate() - prevMonthDays + 1; d <= prevMonthDate.getDate(); d++) {
    days.push({ date: new Date(year, month-1, d).toISOString().split("T")[0], inMonth: false, isToday: false });
  }
  // This month
  for (let d = 1; d <= getDaysInMonth(year, month); d++) {
    const dateStr = new Date(year, month, d).toISOString().split("T")[0];
    days.push({ date: dateStr, inMonth: true, isToday: todayStr === dateStr });
  }
  // Fill to 6 rows (42 days)
  while (days.length % 7 !== 0 || days.length < 42) {
    const next = new Date(year, month, days.length - getDaysInMonth(year, month) - prevMonthDays + 1);
    days.push({ date: next.toISOString().split("T")[0], inMonth: false, isToday: false });
  }
  return days;
}

/**
 * PUBLIC_INTERFACE
 * Calendar grid for monthly view.
 */
function CalendarMonthView({ year, month, events, categories, onSelectDay, onAddEvent, onEditEvent, selectedCategoryIds }) {
  const days = computeMonthDays(year, month);

  function eventsForDay(dayStr) {
    // Select only events from selected categories
    return events.filter(e =>
      e.start.slice(0, 10) === dayStr &&
      categories.find(cat => cat.name === e.category && selectedCategoryIds.includes(cat.id))
    );
  }

  return (
    <div className="calendar-month-view">
      <div className="calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((name, idx) =>
          <div className="calendar-weekday" key={idx}>{name}</div>
        )}
      </div>
      <div className="calendar-days-grid">
        {days.map((d, idx) => (
          <div
            key={d.date + idx}
            className={`calendar-day ${d.isToday ? "today" : ""} ${d.inMonth ? "" : "not-in-month"}`}
            onClick={() => d.inMonth && onSelectDay(d.date)}
          >
            <div className="calendar-day-num">{parseInt(d.date.slice(-2), 10)}</div>
            {eventsForDay(d.date).map(event =>
              <div
                key={event.id}
                className="calendar-event-bullet"
                style={{
                  backgroundColor: categories.find(cat => cat.name === event.category)?.color || COLORS.accent,
                }}
                onClick={ev => { ev.stopPropagation(); onEditEvent(event); }}
                title={event.title}
              >
                {event.title}
              </div>
            )}
            {d.inMonth && (
              <button className="calendar-day-add" aria-label="Add event" onClick={e => { e.stopPropagation(); onAddEvent(d.date); }}>＋</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Event modal for create/update.
 */
function EventModal({ open, event, onClose, onSave, categories }) {
  const [formData, setFormData] = useState(() => ({
    title: event?.title || "",
    start: event?.start || "",
    end: event?.end || "",
    category: event?.category || categories[0].name,
    description: event?.description || "",
  }));

  useEffect(() => {
    setFormData({
      title: event?.title || "",
      start: event?.start || "",
      end: event?.end || "",
      category: event?.category || categories[0].name,
      description: event?.description || "",
    });
  }, [event, categories]);

  const handleChange = e => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    // TODO: Validation
    onSave(formData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form className="event-form" onSubmit={handleSubmit}>
        <h3>{event?.id ? "Edit Event" : "Create Event"}</h3>
        <label>
          Title
          <input name="title" value={formData.title} onChange={handleChange} required />
        </label>
        <label>
          Start
          <input name="start" type="datetime-local" value={formData.start} onChange={handleChange} required />
        </label>
        <label>
          End
          <input name="end" type="datetime-local" value={formData.end} onChange={handleChange} required />
        </label>
        <label>
          Category
          <select name="category" value={formData.category} onChange={handleChange}>
            {categories.map(cat =>
              <option value={cat.name} key={cat.id}>{cat.name}</option>
            )}
          </select>
        </label>
        <label>
          Description
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </label>
        <div className="event-form-actions">
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}

// --- Main Calendar App ---

// PUBLIC_INTERFACE
function App() {
  // THEME
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // AUTH
  const { user, login, logout, register } = React.useContext(AuthContext);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  // CALENDAR VIEW
  const today = new Date();
  const [calendarDate, setCalendarDate] = useState(() => {
    const d = today;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [calendarView, setCalendarView] = useState("month"); // "month" | "week" | "day"
  const curYear = parseInt(calendarDate.split("-")[0], 10);
  const curMonth = parseInt(calendarDate.split("-")[1], 10) - 1;

  // EVENTS (would be loaded from backend)
  const [events, setEvents] = useState(SAMPLE_EVENTS);

  // CATEGORIES (would be loaded/managed per user from backend)
  const [categories, setCategories] = useState(defaultCategories);

  // Category selection
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(categories.map(c => c.id));
  useEffect(() => {
    // Reset when categories change
    setSelectedCategoryIds(categories.map(c => c.id));
  }, [categories]);

  // Event CRUD/Dialogue state
  const [modalState, setModalState] = useState({ open: false, event: null, mode: null, anchorDay: null });

  // --- Event Handlers ---

  // Add/edit/delete events (use backend API calls in real app)
  const handleAddEditEvent = useCallback((evtData) => {
    if (modalState.mode === "edit" && modalState.event) {
      setEvents(evts => evts.map(e => e.id === modalState.event.id ? { ...e, ...evtData } : e));
    } else {
      setEvents(evts => [...evts, { ...evtData, id: Math.max(...evts.map(e => e.id), 0) + 1 }]);
    }
    setModalState({ open: false, event: null, mode: null, anchorDay: null });
  }, [modalState]);

  // Day selection
  const handleSelectDay = (dateStr) => {
    // Optionally, show day view
    setCalendarDate(dateStr.slice(0, 7) + "-01");
    setCalendarView("day");
  };

  // Add event modal
  const handleAddEvent = (dateStr) => {
    setModalState({
      open: true,
      event: {
        start: dateStr + "T09:00",
        end: dateStr + "T10:00",
        category: categories[0].name,
      },
      mode: "add",
      anchorDay: dateStr
    });
  };

  // Edit event modal
  const handleEditEvent = (event) => {
    setModalState({
      open: true,
      event,
      mode: "edit",
      anchorDay: event.start.slice(0, 10),
    });
  };

  // Category selection toggle
  const handleSelectCategory = (catId) => {
    setSelectedCategoryIds(s =>
      s.includes(catId)
        ? s.filter(id => id !== catId)
        : [...s, catId]
    );
  };

  // Category CRUD (for simplicity only edit name/color)
  const [catEditModal, setCatEditModal] = useState({ open: false, category: null, isNew: false });
  const handleAddCategory = () => {
    setCatEditModal({ open: true, category: { name: "", color: COLORS.accent }, isNew: true });
  };
  const handleEditCategory = (cat) => {
    setCatEditModal({ open: true, category: { ...cat }, isNew: false });
  };
  const handleSaveCategory = (cat) => {
    if (catEditModal.isNew) {
      setCategories(cs => [...cs, { ...cat, id: Math.max(...cs.map(c => c.id), 0) + 1 }]);
    } else {
      setCategories(cs => cs.map(c => c.id === catEditModal.category.id ? { ...c, ...cat } : c));
    }
    setCatEditModal({ open: false, category: null, isNew: false });
  };

  // --- UI ---

  if (!user) {
    // Show login/register screens
    return (
      <div className="auth-screen">
        {authMode === "login" ? (
          <LoginForm
            onLogin={login}
            onSwitchToRegister={() => setAuthMode("register")}
          />
        ) : (
          <RegisterForm
            onRegister={register}
            onSwitchToLogin={() => setAuthMode("login")}
          />
        )}
      </div>
    );
  }
  return (
    <div className="app-root">
      <NavBar user={user} onLogout={logout} onThemeToggle={() => setTheme(t => t === "light" ? "dark" : "light")} theme={theme} />
      <div className="calendar-layout">
        <Sidebar
          categories={categories}
          selectedCategoryIds={selectedCategoryIds}
          onSelectCategory={handleSelectCategory}
          onAdd={handleAddCategory}
          onEdit={handleEditCategory}
        />
        <main className="calendar-main">
          <div className="calendar-toolbar">
            <button onClick={() => setCalendarView("month")} className={calendarView === "month" ? "active" : ""}>Month</button>
            <button onClick={() => setCalendarView("week")} className={calendarView === "week" ? "active" : ""}>Week</button>
            <button onClick={() => setCalendarView("day")} className={calendarView === "day" ? "active" : ""}>Day</button>
            <div className="calendar-toolbar-date">
              <button
                onClick={() => {
                  // Previous month
                  const d = new Date(calendarDate);
                  d.setMonth(d.getMonth() - 1);
                  setCalendarDate(d.toISOString().slice(0, 7) + "-01");
                }}>
                &lt;
              </button>
              <span>{today.toLocaleString("default", { month: "long" })} {curYear}</span>
              <button
                onClick={() => {
                  // Next month
                  const d = new Date(calendarDate);
                  d.setMonth(d.getMonth() + 1);
                  setCalendarDate(d.toISOString().slice(0, 7) + "-01");
                }}>
                &gt;
              </button>
            </div>
          </div>
          {/* Calendar display */}
          {calendarView === "month" && (
            <CalendarMonthView
              year={curYear}
              month={curMonth}
              events={events}
              categories={categories}
              onSelectDay={handleSelectDay}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              selectedCategoryIds={selectedCategoryIds}
            />
          )}
          {/* TODO: Implement week/day views (easy extension) */}
        </main>
      </div>

      {/* Event management modal */}
      <EventModal
        open={modalState.open}
        event={modalState.event}
        onClose={() => setModalState({ open: false, event: null, mode: null, anchorDay: null })}
        onSave={handleAddEditEvent}
        categories={categories}
      />
      {/* Category edit modal */}
      <Modal open={catEditModal.open} onClose={() => setCatEditModal({ open: false, category: null, isNew: false })}>
        <form
          className="category-form"
          onSubmit={e => {
            e.preventDefault();
            handleSaveCategory(catEditModal.category);
          }}
        >
          <h3>{catEditModal.isNew ? "Add Category" : "Edit Category"}</h3>
          <label>
            Name
            <input
              value={catEditModal.category?.name || ""}
              onChange={e => setCatEditModal(c => ({ ...c, category: { ...c.category, name: e.target.value } }))}
              required
            />
          </label>
          <label>
            Color
            <input
              type="color"
              value={catEditModal.category?.color || "#cccccc"}
              onChange={e => setCatEditModal(c => ({ ...c, category: { ...c.category, color: e.target.value } }))}
            />
          </label>
          <div className="category-form-actions">
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Wrap in AuthProvider
function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
export default AppWithAuth;
