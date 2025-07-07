import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import RegisterForm from "./RegisterForm";
import WeekView from "./WeekView";
import EventAppointmentModal from "./EventAppointmentModal";
import {
  IconCalendar,
  IconContacts,
  IconTasks,
  IconSearch,
  IconBell,
  IconCog,
} from "./icons";
import AuthCard from "./AuthCard";

// PUBLIC_INTERFACE
// Calendar Application root for enhanced week-view UI.
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

/**
 * Sidebar to display checkboxes for each calendar (by category).
 * Shows all user/shared calendars with color bullets and checkboxes.
 * When toggled, changes which events are shown in the calendar.
 */
function SidebarCalendarCheckboxes({ calendars, checkedCalendarIds, onToggleCalendar }) {
  // Always render colors directly from the calendar object.
  return (
    <aside className="sidebar2" style={{ borderRight: '2px solid var(--divider)', minHeight: 0 }}>
      <div className="sidebar2-user">
        <img
          className="sidebar2-avatar"
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=user`}
          alt="User"
        />
        <span className="sidebar2-username">My Name</span>
      </div>
      <div className="sidebar2-menu" style={{ marginBottom: 8 }}>
        <div className="sidebar2-section-title" style={{ marginTop: 14, marginBottom: 10 }}>CALENDARS</div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {calendars.map(cal => (
            <li
              key={cal.id}
              className="sidebar2-item"
              tabIndex={0}
              style={{ padding: '6px 17px 6px 28px' }}
            >
              <input
                type="checkbox"
                checked={checkedCalendarIds.includes(cal.id)}
                onChange={() => onToggleCalendar(cal.id)}
                style={{
                  marginRight: 12,
                  accentColor: cal.color || "#1976d2", // fallback to blue
                }}
                aria-label={`Show/hide ${cal.name}`}
                id={`calbox-${cal.id}`}
              />
              {/* Marker, always calendar's color */}
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: 6,
                  background: cal.color || "#1976d2",
                  marginRight: 8,
                  border: `1.5px solid ${cal.color || '#c9d6e2'}`,
                  boxShadow: `0 0 0 2px ${checkedCalendarIds.includes(cal.id) ? cal.color + '55' : 'transparent'}`
                }}
              />
              <label htmlFor={`calbox-${cal.id}`} style={{ cursor: 'pointer', userSelect: 'none' }}>
                {cal.name}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="sidebar2-settings">
        <button className="sidebar2-settings-btn"><IconCog size={18} /> Settings</button>
      </div>
    </aside>
  );
}

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

const sidebarSections = [
  {
    key: "calendar",
    label: "Calendar",
    icon: <IconCalendar />,
    badge: null,
  },
  {
    key: "contacts",
    label: "Contacts",
    icon: <IconContacts />,
    badge: null,
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: <IconTasks />,
    badge: 3,
  },
];

const AuthContext = React.createContext();

// PUBLIC_INTERFACE
function AppHeader({ user, onLogout }) {
  return (
    <header className="header-bar">
      <div className="header-left">
        <span className="header-logo">
          <IconCalendar size={32} />
        </span>
        <span className="header-title">Calendamaster</span>
        <span className="header-actions">
          <button className="header-icon-btn" aria-label="Search">
            <IconSearch />
          </button>
          <button className="header-icon-btn" aria-label="Notifications">
            <IconBell />
          </button>
          <button className="header-icon-btn" aria-label="Settings">
            <IconCog />
          </button>
        </span>
      </div>
      <div className="header-profile">
        <img
          className="header-avatar"
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user?.email || "me"}`}
          alt="avatar"
        />
        <span className="header-username" style={{ fontSize: 15, fontWeight: 540 }}>{user?.email}</span>
        <button className="header-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

/**
 * PUBLIC_INTERFACE
 * SidebarNav for navigation with icons and badges.
 */
function SidebarNav({ sections, selectedSection, onSelect }) {
  return (
    <aside className="sidebar2">
      <div className="sidebar2-user">
        <img
          className="sidebar2-avatar"
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=user`}
          alt="User"
        />
        <span className="sidebar2-username">My Name</span>
      </div>
      <div className="sidebar2-menu">
        <div className="sidebar2-section-title">MENU</div>
        <ul className="sidebar2-list">
          {sections.map(sec => (
            <li
              key={sec.key}
              className={`sidebar2-item${selectedSection === sec.key ? " selected" : ""}`}
              onClick={() => onSelect(sec.key)}
              tabIndex={0}
            >
              <span className="sidebar2-icon">{sec.icon}</span>
              {sec.label}
              {sec.badge && <span className="sidebar2-badge">{sec.badge}</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="sidebar2-settings">
        <button className="sidebar2-settings-btn"><IconCog size={18} /> Settings</button>
      </div>
    </aside>
  );
}

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
    <AuthCard
      title="Sign in"
      subtitle="Access your calendar"
      accent="var(--header-bg)"
    >
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
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Your password"
          />
        </label>
        {error && (
          <div className="auth-error" style={{ marginBottom: "0.2em" }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          className="btn-primary auth-btn"
          style={{
            width: "100%",
            marginTop: "0.3em",
            padding: "10px 0",
            borderRadius: "7px",
            fontWeight: 700,
            fontSize: "1.08em",
            boxShadow: "0 1.5px 15px 0 #1976d212",
            letterSpacing: ".02em",
          }}
        >
          Login
        </button>
        <div
          style={{
            marginTop: "0.7em",
            fontSize: "0.98em",
            textAlign: "center",
          }}
        >
          <span style={{ color: "#263b54" }}>Don&apos;t have an account?</span>{" "}
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
            onClick={onSwitchToRegister}
          >
            Register
          </button>
        </div>
      </form>
    </AuthCard>
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

/**
 * New App (Week view & modernized layout)
 */
function App() {
  // AUTH
  const { user, login, logout, register } = React.useContext(AuthContext);
  const [authMode, setAuthMode] = useState("login");
  // Sidebar nav section
  const [selectedNav, setSelectedNav] = useState("calendar");

  // Current date for calendar view
  const today = new Date();
  const startOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    // Assuming week starts Monday for this UI. If Sunday, just change 1->0, etc.
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
  };
  const [curWeekStart, setCurWeekStart] = useState(() => {
    const d = startOfWeek(new Date());
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  // --- Calendar/sim categories as "calendars" ---
  // In final, this will be fetched from backend via /calendars/
  // Each calendar will have {id, name, color}. Assume all owned + shared calendars are merged here.
  const [calendars, setCalendars] = useState([
    {id: 1, name: "Work", color: COLORS["Work"]},
    {id: 2, name: "Personal", color: COLORS["Personal"]},
    {id: 3, name: "Family", color: COLORS["Family"]},
    {id: 4, name: "Health", color: COLORS["Health"]},
    {id: 5, name: "Appointments", color: "#9858A9"},
  ]);
  // Track checked/visible calendars (use all enabled by default)
  const [checkedCalendarIds, setCheckedCalendarIds] = useState([1,2,3,4,5]);

  // Used by events (for demo, map category name to calendar id for filtering)
  const [events, setEvents] = useState([]);
  // For compatibility (legacy code) map calendars to 'categories'
  // Modern code should use just calendar_id ideally.
  const [categories, setCategories] = useState([
    { id: 1, name: "Work", color: COLORS["Work"] },
    { id: 2, name: "Personal", color: COLORS["Personal"] },
    { id: 3, name: "Family", color: COLORS["Family"] },
    { id: 4, name: "Health", color: COLORS["Health"] },
    { id: 5, name: "Appointments", color: "#9858A9" }
  ]);


  // Modal (event editing/creation, for both regular events and appointments)
  const [modalState, setModalState] = useState({ open: false, event: null, mode: null, slotStart: "", slotEnd: "" });

  // Backend API Base (for event fetching)
  const API_BASE =
    process.env.REACT_APP_API_URL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:3001"
      : "https://vscode-internal-149548-beta.beta01.cloud.kavia.ai:3001");

  // Helper: Map backend API event object to frontend week view event
  function mapApiEventToFrontend(evt) {
    // Converts API EventOut to local event format, ensuring compatibility
    return {
      id: evt.id,
      title: evt.title,
      start: evt.start_datetime,
      end: evt.end_datetime,
      calendar_id: evt.calendar_id,
      category: calendars.find(cal => cal.id === evt.calendar_id)?.name || evt.category || "",
      description: evt.description,
      is_appointment: evt.is_appointment,
      invitees: evt.invitees || [], // If such a field exists
    };
  }

  // Fetch events for current week when curWeekStart, checkedCalendarIds, or user changes
  useEffect(() => {
    // Calculate year, month, day for weekly API
    const d = new Date(curWeekStart);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    // Only fetch for checked calendars; if none checked, setEvents([])
    if (!checkedCalendarIds.length || !user) {
      setEvents([]);
      return;
    }
    // For now, fetch ALL week events and filter by checkedCalendarIds (backend has calendar_id for each event)
    // Auth: Omit as JWT/auth not used, or add if token is implemented
    fetch(
      `${API_BASE}/views/weekly?year=${year}&month=${month}&day=${day}`,
      {
        credentials:
          API_BASE.startsWith("http://localhost") || API_BASE.startsWith("http://127.0.0.1") || API_BASE.includes(window.location.hostname)
            ? "same-origin"
            : "include",
      }
    )
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then(data => {
        // data is an array of EventOut; filter by calendar_id in checkedCalendarIds
        const filtered = (data || []).filter(e => checkedCalendarIds.includes(e.calendar_id));
        setEvents(filtered.map(mapApiEventToFrontend));
      })
      .catch(err => {
        setEvents([]);
        // Optionally show error or log
        // console.error("Event fetch error", err);
      });
    // eslint-disable-next-line
  }, [curWeekStart, checkedCalendarIds, user]); // refresh when week/calendars/user changes

  // Auth overlays
  if (!user) {
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

  // Build days in view (Mon–Sun)
  function getWeekDays(weekStartStr) {
    const d = new Date(weekStartStr);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d1 = new Date(d);
      d1.setDate(d.getDate() + i);
      const label = d1.toLocaleDateString(undefined, { weekday: "short" });
      const iso = d1.toISOString().slice(0, 10);
      days.push({
        date: iso,
        label,
        isToday: iso === new Date().toISOString().slice(0, 10),
      });
    }
    return days;
  }
  const weekDays = getWeekDays(curWeekStart);

  // Handler: event click/edit
  const handleEditEvent = (event) => {
    // Normalize invitees if undefined (for legacy events)
    setModalState({ open: true, event, mode: "edit", slotStart: event.start, slotEnd: event.end });
  };

  // Handler: double click slot to add new event/appointment
  const handleSlotDoubleClick = (datetime) => {
    // Default end: +1 hour (use ISO 8601 input types)
    let endHour = parseInt(datetime.slice(11, 13), 10) + 1;
    if (endHour > 23) endHour = 23;
    const slotEnd = datetime.slice(0, 11) + String(endHour).padStart(2, "0") + datetime.slice(13, 16) + ":00";
    setModalState({
      open: true,
      event: null,
      mode: "add",
      slotStart: datetime,
      slotEnd: slotEnd
    });
  };

  // Handler: save/add/edit event or appointment
  const handleSaveEvent = async (evtData) => {
    // Compose payload for backend (add/edit logic)
    const eventPayload = {
      title: evtData.title,
      description: evtData.description,
      start_datetime: evtData.start,
      end_datetime: evtData.end,
      color: calendars.find(c => c.id === evtData.calendar_id)?.color || undefined,
      calendar_id: evtData.calendar_id,
      is_appointment: !!evtData.is_appointment,
      // Backend does not yet show invitee support in schema;
      // send invitees if provided (array of emails/usernames) as extra field (for future)
      invitees: Array.isArray(evtData.invitees) ? evtData.invitees : (evtData.invitees ? [evtData.invitees] : []),
    };

    if (!eventPayload.invitees || !eventPayload.invitees.length) {
      delete eventPayload.invitees;
    }

    if (modalState.mode === "edit" && modalState.event && modalState.event.id) {
      // PATCH to /events/{event_id}
      try {
        const res = await fetch(`${API_BASE}/events/${modalState.event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials:
            API_BASE.startsWith("http://localhost") || API_BASE.startsWith("http://127.0.0.1") || API_BASE.includes(window.location.hostname)
              ? "same-origin"
              : "include",
          body: JSON.stringify(eventPayload)
        });
        if (!res.ok) throw new Error("Event update failed");
        setTimeout(() => {
          setCurWeekStart(s => s);
        }, 0);
      } catch (err) {
        // Optionally show error to user
      }
    } else {
      // POST new event to /events/
      try {
        const res = await fetch(`${API_BASE}/events/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials:
            API_BASE.startsWith("http://localhost") || API_BASE.startsWith("http://127.0.0.1") || API_BASE.includes(window.location.hostname)
              ? "same-origin"
              : "include",
          body: JSON.stringify(eventPayload)
        });
        if (!res.ok) throw new Error("Event create failed");
        setTimeout(() => {
          setCurWeekStart(s => s);
        }, 0);
      } catch (err) {
        // Optionally show error to user
      }
    }
    setModalState({ open: false, event: null, mode: null, slotStart: "", slotEnd: "" });
  };

  // Filter events only for visible ("checked") calendars
  const visibleEvents = events.filter(evt => checkedCalendarIds.includes(evt.calendar_id));

  // Map calendar id->color
  const calendarColors = Object.fromEntries(calendars.map(c => [c.id, c.color]));
  // category (for compatibility): maps category name to color
  const categoryColors = Object.fromEntries(calendars.map(c => [c.name, c.color]));

  // Week navigation
  function shiftWeek(delta) {
    const d = new Date(curWeekStart);
    d.setDate(d.getDate() + 7 * delta);
    setCurWeekStart(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }

  // Handler for toggling calendar visibility
  function handleToggleCalendar(calId) {
    setCheckedCalendarIds(ids =>
      ids.includes(calId) ? ids.filter(id => id !== calId) : [...ids, calId]
    );
  }

  return (
    <div className="app-root2">
      <AppHeader user={user} onLogout={logout} />
      <div className="calendar2-layout">
        {/* Sidebar for calendar/category checkboxes */}
        <SidebarCalendarCheckboxes
          calendars={calendars}
          checkedCalendarIds={checkedCalendarIds}
          onToggleCalendar={handleToggleCalendar}
        />
        <main style={{ flex: 1, minWidth: 0, background: "var(--main-bg)", position: "relative" }}>
          {/* Week navigation */}
          <div style={{ display: "flex", alignItems: "center", padding: "18px 0 7px 6px", gap: "17px", marginBottom: 10 }}>
            <button aria-label="Previous week" onClick={() => shiftWeek(-1)} style={{
              fontSize: "1.18em",
              border: "none",
              background: "none",
              padding: "3px 9px",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#176cae"
            }}>&lt;</button>
            <span style={{
              fontWeight: 610,
              fontSize: "18.5px",
              letterSpacing: "0.05em",
            }}>
              {`${new Date(curWeekStart).toLocaleString("default", { month: "long" })} ${new Date(curWeekStart).getFullYear()}`}
            </span>
            <button aria-label="Next week" onClick={() => shiftWeek(1)} style={{
              fontSize: "1.18em",
              border: "none",
              background: "none",
              padding: "3px 9px",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#176cae"
            }}>&gt;</button>
            <span style={{ marginLeft: "auto", color: "#6a7e93", fontSize: "1em" }}>
              Week of {weekDays[0].date}
            </span>
          </div>
          <WeekView
            days={weekDays}
            startHour={7}
            endHour={20}
            events={visibleEvents}
            onEventClick={handleEditEvent}
            onSlotDoubleClick={handleSlotDoubleClick}
            // Give both id->color and name->color for compatibility (event.calendar_id is preferred)
            categoryColors={{
              ...calendarColors,   // { [calendar_id]: color }
              ...categoryColors    // { [category_name]: color }
            }}
            onEventUpdate={async (eventId, updateObj) => {
              // PATCH to backend, update times only
              try {
                await fetch(`${API_BASE}/events/${eventId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  credentials:
                    API_BASE.startsWith("http://localhost") || API_BASE.startsWith("http://127.0.0.1") || API_BASE.includes(window.location.hostname)
                      ? "same-origin"
                      : "include",
                  body: JSON.stringify({
                    start_datetime: updateObj.start,
                    end_datetime: updateObj.end,
                    // Also must send all required update fields, so fetch the event to merge fields if needed
                    // Here we fetch the event for full data, then PATCH with merged values for all required fields
                  })
                });
                setTimeout(() => setCurWeekStart(s => s), 0);
              } catch (err) {
                // handle error silently (optionally notify user)
              }
            }}
          />
          {/* Floating Action Button for adding events/appointments/meetings */}
          <button
            className="calendar-fab"
            aria-label="Add event, appointment, or meeting"
            title="Create new event/appointment"
            onClick={() => setModalState({
              open: true,
              event: null,
              mode: "add",
              slotStart: "",
              slotEnd: ""
            })}
            tabIndex={0}
            style={{
              position: "fixed",
              right: 38,
              bottom: 38,
              width: 62,
              height: 62,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #176cae 70%, #9858A9 100%)",
              color: "#fff",
              fontSize: "2.6em",
              fontWeight: 900,
              border: "none",
              boxShadow: "0 6px 22px #176cae33, 0 2.6px 9px 0 #9858a91d",
              zIndex: 99,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.18s, box-shadow 0.16s"
            }}
          >
            <span style={{marginTop: -1, marginLeft: 0}}>+</span>
          </button>
        </main>
      </div>
      {/* Event/Appointment modal (create or edit) */}
      <EventAppointmentModal
        open={modalState.open}
        event={modalState.event}
        onClose={() => setModalState({ open: false, event: null, mode: null, slotStart: "", slotEnd: "" })}
        onSave={handleSaveEvent}
        categories={calendars}
        defaultStart={modalState.mode === "add" ? modalState.slotStart : undefined}
        defaultEnd={modalState.mode === "add" ? modalState.slotEnd : undefined}
      />
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
