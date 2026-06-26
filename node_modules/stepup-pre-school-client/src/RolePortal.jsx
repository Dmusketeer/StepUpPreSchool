import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  LogOut,
  School,
  ShieldCheck,
  Users
} from "lucide-react";
import { requestJson } from "./services/apiClient.js";

const roleOptions = [
  {
    key: "parent",
    title: "Parent Login",
    icon: Users,
    username: "parent",
    password: "parent123",
    text: "Track child updates, attendance, activities, notices, and teacher notes."
  },
  {
    key: "teacher",
    title: "Teacher Login",
    icon: GraduationCap,
    username: "teacher",
    password: "teacher123",
    text: "Manage classroom tasks, attendance, activity updates, and parent communication."
  },
  {
    key: "admin",
    title: "Admin Login",
    icon: ShieldCheck,
    username: "admin",
    password: "stepup123",
    text: "Open the protected admin panel for website data, media, enquiries, and password reset."
  }
];

const dashboardIcons = [CheckCircle2, CalendarDays, ClipboardList, BookOpenCheck];

function RolePortal() {
  const initialRole = new URLSearchParams(window.location.search).get("role") || "parent";
  const [activeRole, setActiveRole] = useState(roleOptions.some((role) => role.key === initialRole) ? initialRole : "parent");
  const [form, setForm] = useState({ username: roleOptions.find((role) => role.key === activeRole)?.username ?? "", password: "" });
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const activeRoleData = useMemo(() => roleOptions.find((role) => role.key === activeRole) ?? roleOptions[0], [activeRole]);
  const ActiveRoleIcon = activeRoleData.icon;
  const isAdmin = activeRole === "admin";

  function switchRole(roleKey) {
    const nextRole = roleOptions.find((role) => role.key === roleKey) ?? roleOptions[0];
    setActiveRole(roleKey);
    setForm({ username: nextRole.username, password: "" });
    setSession(null);
    setStatus({ type: "idle", message: "" });
  }

  async function login(event) {
    event.preventDefault();

    if (isAdmin) {
      window.location.href = "/admin";
      return;
    }

    setStatus({ type: "loading", message: "Checking login details..." });

    try {
      const data = await requestJson("/api/portal/login", {
        method: "POST",
        body: JSON.stringify({ role: activeRole, ...form })
      });

      setSession(data.user);
      setStatus({ type: "success", message: `Welcome, ${data.user.name}.` });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  return (
    <main className="role-page">
      <a className="role-back-link" href="/">
        Back to website
      </a>
      <section className="role-hero">
        <div>
          <span className="section-kicker">StepUp Secure Portals</span>
          <h1>Choose your role to continue</h1>
          <p>Parents, teachers, and administrators get a focused dashboard for the work they need to do.</p>
        </div>
        <div className="role-school-badge" aria-hidden="true">
          <School size={44} />
        </div>
      </section>

      <div className="role-layout">
        <aside className="role-selector" aria-label="Choose login role">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            return (
              <button className={activeRole === role.key ? "active" : ""} type="button" key={role.key} onClick={() => switchRole(role.key)}>
                <Icon size={24} />
                <span>
                  <strong>{role.title}</strong>
                  <small>{role.text}</small>
                </span>
              </button>
            );
          })}
        </aside>

        <section className="role-card">
          {!session ? (
            <form className="role-login-form" onSubmit={login}>
              <div className="role-card-title">
                <ActiveRoleIcon size={30} />
                <div>
                  <h2>{activeRoleData.title}</h2>
                  <p>{activeRoleData.text}</p>
                </div>
              </div>

              {isAdmin ? (
                <div className="role-admin-note">
                  <ShieldCheck size={24} />
                  <p>Admin login opens the existing protected admin panel.</p>
                </div>
              ) : (
                <>
                  <label>
                    Username
                    <input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} required />
                  </label>
                  <label>
                    Password
                    <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
                  </label>
                  <p className="demo-credentials">
                    Demo: <strong>{activeRoleData.username}</strong> / <strong>{activeRoleData.password}</strong>
                  </p>
                </>
              )}

              <button className="button primary" type="submit">
                {isAdmin ? "Open Admin Panel" : "Login"}
                <ArrowRight size={18} />
              </button>
              {status.message && <p className={`role-status ${status.type}`}>{status.message}</p>}
            </form>
          ) : (
            <RoleDashboard session={session} onLogout={() => setSession(null)} />
          )}
        </section>
      </div>
    </main>
  );
}

function RoleDashboard({ session, onLogout }) {
  const erp = session.erp;

  return (
    <div className="role-dashboard">
      <div className="role-dashboard-header">
        <div>
          <span className="section-kicker">{session.role} dashboard</span>
          <h2>{session.headline}</h2>
          <p>Welcome, {session.name}</p>
        </div>
        <button className="button light" type="button" onClick={onLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="role-summary-grid">
        {session.dashboard.summary.map((item, index) => {
          const Icon = dashboardIcons[index % dashboardIcons.length];
          return (
            <article className="role-summary-card" key={item.label}>
              <Icon size={22} />
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          );
        })}
      </div>

      {erp && (
        <section className="role-erp-panel">
          <div className="role-panel-heading">
            <h3>{erp.title}</h3>
            <p>{erp.subtitle}</p>
          </div>
          <div className="role-summary-grid erp-summary-grid">
            {erp.summary.map((item, index) => {
              const Icon = dashboardIcons[index % dashboardIcons.length];
              return (
                <article className="role-summary-card" key={item.label}>
                  <Icon size={22} />
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              );
            })}
          </div>
          <div className="role-erp-module-grid">
            {erp.modules.map((module) => (
              <article className="role-erp-module-card" key={module.key}>
                <strong>{module.label}</strong>
                <p>{module.roleDescription || module.description}</p>
                <div>
                  {module.metrics.map((metric) => (
                    <span key={metric.label}>{metric.label}: {metric.value}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="role-quick-actions">
            {erp.quickActions.map((action) => (
              <button type="button" key={action}>{action}</button>
            ))}
          </div>
        </section>
      )}

      <div className="role-dashboard-grid">
        <section className="role-info-panel">
          <h3>Profile</h3>
          {Object.entries(session.profile).map(([key, value]) => (
            <div className="role-profile-row" key={key}>
              <span>{formatLabel(key)}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        <section className="role-info-panel">
          <h3>Notices</h3>
          <ul className="role-notice-list">
            {session.dashboard.notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        </section>

        <section className="role-info-panel wide-panel">
          <h3>Today</h3>
          <div className="role-timeline-list">
            {session.dashboard.timeline.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatLabel(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

export default RolePortal;