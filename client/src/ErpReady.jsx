import { useEffect, useState } from "react";
import { ArrowLeft, Boxes, CheckCircle2, Layers3, School } from "lucide-react";
import { requestJson } from "./services/apiClient.js";

const roleFilters = ["all", "parent", "teacher", "admin"];

function ErpReady() {
  const [modules, setModules] = useState([]);
  const [activeRole, setActiveRole] = useState("all");
  const [status, setStatus] = useState("Loading ERP module plan...");

  useEffect(() => {
    let isMounted = true;

    const query = activeRole === "all" ? "" : `?role=${activeRole}`;
    requestJson(`/api/erp/modules${query}`)
      .then((data) => {
        if (isMounted) {
          setModules(data.modules ?? []);
          setStatus(activeRole === "all" ? "Showing all ERP modules." : `Showing ${activeRole} ERP access.`);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setStatus(error.message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeRole]);

  return (
    <main className="erp-page">
      <a className="role-back-link" href="/">
        <ArrowLeft size={18} />
        Back to website
      </a>
      <section className="erp-hero">
        <div>
          <span className="section-kicker">ERP Ready</span>
          <h1>School ERP foundation</h1>
          <p>Student records, attendance, fees, homework, exams, staff, transport, and communication modules can be added as independent features.</p>
        </div>
        <div className="role-school-badge" aria-hidden="true">
          <School size={44} />
        </div>
      </section>

      <section className="erp-layout">
        <div className="erp-info-card">
          <Layers3 size={30} />
          <h2>Role based ERP modules</h2>
          <p>Each ERP feature declares which roles can use it. Parent, teacher, and admin dashboards receive only the modules intended for that role.</p>
          <span>{status}</span>
          <div className="erp-role-filter" aria-label="ERP role filter">
            {roleFilters.map((role) => (
              <button className={activeRole === role ? "active" : ""} type="button" key={role} onClick={() => setActiveRole(role)}>
                {role}
              </button>
            ))}
          </div>
        </div>
        <div className="erp-module-grid">
          {modules.map((module) => (
            <article className="erp-module-card" key={module.key}>
              <Boxes size={24} />
              <strong>{module.label}</strong>
              <p>{module.roleDescription || module.description}</p>
              <span>{module.roles.join(" / ")}</span>
            </article>
          ))}
          {!modules.length && (
            <article className="erp-module-card">
              <CheckCircle2 size={24} />
              <strong>ERP namespace ready</strong>
              <span>Waiting for modules</span>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}

export default ErpReady;
