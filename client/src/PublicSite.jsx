import { useEffect, useMemo, useState } from "react";
import ThreePlayBackground from "./ThreePlayBackground.jsx";
import creatorLogo from "./assets/my-logo.png";
import { storageKeys } from "./config/storageKeys.js";
import { requestJson } from "./services/apiClient.js";
import {
  ArrowRight,
  Baby,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileDown,
  HeartHandshake,
  HelpCircle,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Palette,
  Phone,
  School,
  Send,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Sprout,
  Star,
  Users,
  Video,
  X
} from "lucide-react";

import { allGalleryCategory, iconMap, navItems, socialPlatforms } from "./public/publicConfig.js";
import { createBrochureDownloadHref, createWhatsAppLink, formatCount } from "./public/publicUtils.js";

function PublicSite() {
  const [site, setSite] = useState(null);
  const [visitorStats, setVisitorStats] = useState(null);
  const [viewer, setViewer] = useState({ items: [], index: 0, open: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    requestJson("/api/site")
      .then((data) => {
        if (isMounted) {
          setSite(data);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const alreadyCounted = sessionStorage.getItem(storageKeys.visitorSession) === "true";

    requestJson("/api/visits", {
      method: alreadyCounted ? "GET" : "POST"
    })
      .then((stats) => {
        if (!alreadyCounted) {
          sessionStorage.setItem(storageKeys.visitorSession, "true");
        }

        if (isMounted) {
          setVisitorStats(stats);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!site) {
      return undefined;
    }

    const revealElements = document.querySelectorAll(".reveal-section, .reveal-item");

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [site, visitorStats]);

  useEffect(() => {
    if (!viewer.open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeViewer();
      }

      if (event.key === "ArrowRight") {
        goToNextMedia();
      }

      if (event.key === "ArrowLeft") {
        goToPreviousMedia();
      }
    };

    document.body.classList.add("viewer-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("viewer-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewer.open, viewer.items.length]);

  const openViewer = (items, index) => {
    setViewer({ items, index, open: true });
  };

  const closeViewer = () => {
    setViewer((current) => ({ ...current, open: false }));
  };

  const goToNextMedia = () => {
    setViewer((current) => ({ ...current, index: (current.index + 1) % current.items.length }));
  };

  const goToPreviousMedia = () => {
    setViewer((current) => ({ ...current, index: (current.index - 1 + current.items.length) % current.items.length }));
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !site) {
    return <ErrorScreen message={error} />;
  }

  const galleryItems = [
    ...(site.media ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      src: item.url,
      title: item.title,
      alt: item.alt || item.title,
      category: item.category || "Recent Uploads"
    })),
    ...site.gallery.map((item, index) => ({
      id: `default-gallery-${index}`,
      type: "image",
      src: item.image,
      title: item.title,
      alt: item.alt || item.title,
      category: item.category || "Campus"
    }))
  ];

  return (
    <div className="site-shell">
      <ThreePlayBackground />
      <SiteHeader contact={site.contact} />
      <main>
        <Hero hero={site.hero} brochure={site.brochure} />
        <Stats stats={site.stats} visitorStats={visitorStats} />
        <RoleAccessSection />
        <About data={site.about} />
        <Programs programs={site.programs} />
        <FeeStructure fees={site.fees} brochure={site.brochure} contact={site.contact} />
        <WhyStepUp items={site.whyStepUp} />
        <DailyRhythm schedule={site.dailyRhythm} />
        <Admissions steps={site.admissions} />
        <AdmissionApplication programs={site.programs} />
        <Gallery items={galleryItems} categories={site.galleryCategories ?? []} onOpenViewer={openViewer} />
        <Events events={site.events} notices={site.notices ?? []} />
        <Teachers teachers={site.teachers ?? []} />
        <Testimonials testimonials={site.testimonials} />
        <FaqSection faqs={site.faqs ?? []} />
        <MapSection map={site.map} contact={site.contact} />
        <ContactSection contact={site.contact} programs={site.programs} socialLinks={site.socialLinks} />
      </main>
      <SiteFooter contact={site.contact} socialLinks={site.socialLinks} />
      <MediaViewer viewer={viewer} onClose={closeViewer} onNext={goToNextMedia} onPrevious={goToPreviousMedia} />
      <WhatsAppButton contact={site.contact} />
    </div>
  );
}

function RoleAccessSection() {
  const roles = [
    {
      title: "Parent Login",
      text: "Child updates, attendance, notices, activities, and teacher notes.",
      href: "/portal?role=parent",
      Icon: Users
    },
    {
      title: "Teacher Login",
      text: "Classroom overview, daily tasks, parent updates, and activity planning.",
      href: "/portal?role=teacher",
      Icon: BookOpenCheck
    },
    {
      title: "Admin Login",
      text: "Website content, enquiries, media uploads, social links, and password reset.",
      href: "/admin",
      Icon: ShieldCheck
    }
  ];

  return (
    <section className="section role-access-section reveal-section">
      <div className="container">
        <SectionIntro
          kicker="Role Based Access"
          title="Separate login spaces for every school role"
          text="Parents, teachers, and administrators can open the right dashboard for their daily work."
        />
        <div className="role-access-grid">
          {roles.map(({ title, text, href, Icon }, index) => (
            <a className="role-access-card reveal-item" href={href} key={title} style={{ "--reveal-delay": `${index * 80}ms` }}>
              <Icon size={28} />
              <h3>{title}</h3>
              <p>{text}</p>
              <span>
                Open Portal
                <ArrowRight size={17} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function LoadingScreen() {
  return (
    <div className="screen-state">
      <div className="brand-mark" aria-hidden="true">
        <School size={32} />
      </div>
      <p>Loading StepUp Pre School...</p>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="screen-state">
      <div className="brand-mark danger" aria-hidden="true">
        <X size={30} />
      </div>
      <h1>StepUp Pre School</h1>
      <p>{message || "The website could not load right now."}</p>
    </div>
  );
}

function SiteHeader({ contact }) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <a className="logo" href="#top" aria-label="StepUp Pre School home" onClick={closeMenu}>
        <span className="logo-icon" aria-hidden="true">
          <img className="logo-mark" src={creatorLogo} alt="" />
        </span>
        <span>
          <strong>StepUp</strong>
          <small>Pre School</small>
        </span>
      </a>

      <button
        className="icon-button menu-toggle"
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={closeMenu}>
            {item.label}
          </a>
        ))}
        <a className="nav-call" href={`tel:${contact.phone.replace(/\s+/g, "")}`} onClick={closeMenu}>
          <Phone size={17} />
          {contact.phone}
        </a>
      </nav>
    </header>
  );
}

function Hero({ hero, brochure }) {
  return (
    <section id="top" className="hero reveal-section" style={{ backgroundImage: `url(${hero.image})` }}>
      <div className="hero-overlay" />
      <div className="hero-content reveal-item">
        <span className="section-kicker">{hero.kicker}</span>
        <h1>{hero.title}</h1>
        <p>{hero.subtitle}</p>
        <div className="hero-actions">
          <a className="button primary" href="#contact">
            Enquire Now
            <ArrowRight size={18} />
          </a>
          <a className="button light" href="#programs">
            View Programs
            <BookOpenCheck size={18} />
          </a>
          {brochure && (
            <a className="button light" href="#brochure">
              Brochure
              <FileDown size={18} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function Stats({ stats, visitorStats }) {
  const displayStats = visitorStats
    ? [
        ...stats,
        {
          value: formatCount(visitorStats.totalVisitors),
          label: "Website Visitors"
        }
      ]
    : stats;

  return (
    <section className="stats-band reveal-section" aria-label="School highlights">
      <div className="container stats-grid">
        {displayStats.map((stat, index) => (
          <div className="stat-item reveal-item" key={stat.label} style={{ "--reveal-delay": `${index * 70}ms` }}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function About({ data }) {
  return (
    <section id="about" className="section about-section reveal-section">
      <div className="container split-layout">
        <div className="image-frame reveal-item">
          <img src={data.image} alt="Children learning together in a bright preschool classroom" />
        </div>
        <div className="section-copy reveal-item" style={{ "--reveal-delay": "120ms" }}>
          <SectionIntro kicker="About StepUp" title={data.title} text={data.text} />
          <div className="feature-list">
            {data.highlights.map((highlight, index) => (
              <div className="feature-row reveal-item" key={highlight} style={{ "--reveal-delay": `${180 + index * 70}ms` }}>
                <CheckCircle2 size={20} />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Programs({ programs }) {
  return (
    <section id="programs" className="section muted-section reveal-section">
      <div className="container">
        <SectionIntro
          kicker="Learning Programs"
          title="Age-wise playway journeys"
          text="Every room is designed for discovery, expression, social confidence, and gentle school readiness."
        />
        <div className="program-grid">
          {programs.map((program, index) => {
            const Icon = iconMap[program.icon] ?? Sparkles;

            return (
              <article className="program-card reveal-item" key={program.title} style={{ "--reveal-delay": `${index * 80}ms` }}>
                <div className="card-icon" aria-hidden="true">
                  <Icon size={25} />
                </div>
                <div>
                  <span className="program-age">{program.ageGroup}</span>
                  <h3>{program.title}</h3>
                  <p>{program.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeeStructure({ fees, brochure, contact }) {
  const brochureHref = createBrochureDownloadHref({ brochure, contact, fees });

  return (
    <section id="fees" className="section fee-section reveal-section">
      <div className="container fee-layout">
        <div className="fee-copy reveal-item">
          <SectionIntro
            kicker="Fee Structure"
            title="Clear admission and monthly fee guidance"
            text={fees.note}
          />
          <div className="fee-grid">
            {fees.items.map((item, index) => (
              <article className="fee-card reveal-item" key={item.title} style={{ "--reveal-delay": `${index * 80}ms` }}>
                <span>{item.amount}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
        <aside id="brochure" className="brochure-card reveal-item" style={{ "--reveal-delay": "180ms" }}>
          <FileDown size={34} />
          <h3>{brochure.title}</h3>
          <p>{brochure.description}</p>
          <a className="button primary" href={brochureHref} download="StepUp-Pre-School-Brochure.pdf">
            Download Brochure
            <FileDown size={18} />
          </a>
        </aside>
      </div>
    </section>
  );
}

function WhyStepUp({ items }) {
  return (
    <section className="section reveal-section">
      <div className="container">
        <SectionIntro
          kicker="Why Families Choose Us"
          title="A caring start with strong foundations"
          text="StepUp blends play, routines, safety, and parent communication into a happy early learning experience."
        />
        <div className="reason-grid">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon] ?? Star;

            return (
              <article className="reason-card reveal-item" key={item.title} style={{ "--reveal-delay": `${index * 80}ms` }}>
                <Icon size={24} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DailyRhythm({ schedule }) {
  return (
    <section className="section rhythm-section reveal-section">
      <div className="container rhythm-layout">
        <SectionIntro
          kicker="Daily Rhythm"
          title="A day that feels calm, active, and familiar"
          text="Children move through the day with predictable routines and a healthy mix of guided and self-led play."
        />
        <div className="timeline">
          {schedule.map((item, index) => (
            <div className="timeline-item reveal-item" key={`${item.time}-${item.activity}`} style={{ "--reveal-delay": `${index * 75}ms` }}>
              <span>{item.time}</span>
              <div>
                <h3>{item.activity}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Admissions({ steps }) {
  return (
    <section id="admissions" className="section muted-section reveal-section">
      <div className="container">
        <SectionIntro
          kicker="Admissions"
          title="Simple steps for a confident start"
          text="Visit the campus, meet the teachers, and choose the program that fits your child best."
        />
        <div className="admission-steps">
          {steps.map((step, index) => (
            <article className="step-card reveal-item" key={step.title} style={{ "--reveal-delay": `${index * 90}ms` }}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdmissionApplication({ programs }) {
  const programNames = useMemo(() => programs.map((program) => program.title), [programs]);
  const [form, setForm] = useState({
    guardianName: "",
    phone: "",
    email: "",
    childName: "",
    childAge: "",
    interest: programNames[0] ?? "",
    preferredStart: "",
    transport: "No",
    address: "",
    previousSchool: "",
    message: ""
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Submitting admission form..." });

    const admissionMessage = [
      "Online admission application",
      `Preferred start: ${form.preferredStart || "Not specified"}`,
      `Transport required: ${form.transport}`,
      `Address: ${form.address || "Not provided"}`,
      `Previous school: ${form.previousSchool || "Not applicable"}`,
      `Notes: ${form.message || "None"}`
    ].join("\n");

    try {
      const response = await requestJson("/api/enquiries", {
        method: "POST",
        body: JSON.stringify({
          guardianName: form.guardianName,
          phone: form.phone,
          email: form.email,
          childName: form.childName,
          childAge: form.childAge,
          interest: `Admission - ${form.interest}`,
          message: admissionMessage
        })
      });

      setStatus({ type: "success", message: response.message });
      setForm({
        guardianName: "",
        phone: "",
        email: "",
        childName: "",
        childAge: "",
        interest: programNames[0] ?? "",
        preferredStart: "",
        transport: "No",
        address: "",
        previousSchool: "",
        message: ""
      });
    } catch (requestError) {
      setStatus({ type: "error", message: requestError.message });
    }
  };

  return (
    <section className="section admission-form-section reveal-section">
      <div className="container admission-form-layout">
        <div className="admission-form-copy reveal-item">
          <SectionIntro
            kicker="Online Admission"
            title="Apply for admission from home"
            text="Share the details once and the admissions team will call you with program availability, visit timing, and next steps."
          />
          <div className="admission-checklist">
            <span><CheckCircle2 size={18} /> Program counselling</span>
            <span><CheckCircle2 size={18} /> Transport discussion</span>
            <span><CheckCircle2 size={18} /> Document guidance</span>
          </div>
        </div>
        <form className="enquiry-form admission-form reveal-item" style={{ "--reveal-delay": "140ms" }} onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Parent Name
              <input name="guardianName" value={form.guardianName} onChange={updateField} required />
            </label>
            <label>
              Phone Number
              <input name="phone" value={form.phone} onChange={updateField} required />
            </label>
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={updateField} />
            </label>
            <label>
              Child Name
              <input name="childName" value={form.childName} onChange={updateField} required />
            </label>
            <label>
              Child Age
              <input name="childAge" value={form.childAge} onChange={updateField} required />
            </label>
            <label>
              Applying For
              <select name="interest" value={form.interest} onChange={updateField} required>
                {programNames.map((program) => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </label>
            <label>
              Preferred Start
              <input name="preferredStart" value={form.preferredStart} onChange={updateField} placeholder="Month or date" />
            </label>
            <label>
              Transport Required
              <select name="transport" value={form.transport} onChange={updateField}>
                <option>No</option>
                <option>Yes</option>
                <option>Need to discuss</option>
              </select>
            </label>
          </div>
          <label>
            Address
            <textarea name="address" value={form.address} onChange={updateField} rows="3" />
          </label>
          <label>
            Previous School / Notes
            <textarea name="previousSchool" value={form.previousSchool} onChange={updateField} rows="3" />
          </label>
          <label>
            Message
            <textarea name="message" value={form.message} onChange={updateField} rows="3" />
          </label>
          <button className="button primary form-submit" type="submit" disabled={status.type === "loading"}>
            {status.type === "loading" ? "Submitting" : "Submit Admission Form"}
            <Send size={18} />
          </button>
          {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}
        </form>
      </div>
    </section>
  );
}

function Gallery({ items, categories, onOpenViewer }) {
  const availableCategories = useMemo(() => {
    const itemCategories = items.map((item) => item.category).filter(Boolean);
    return [allGalleryCategory, ...new Set([...categories, ...itemCategories])];
  }, [categories, items]);
  const [activeCategory, setActiveCategory] = useState(allGalleryCategory);
  const visibleItems = activeCategory === allGalleryCategory ? items : items.filter((item) => item.category === activeCategory);
  const viewerItems = visibleItems.map((item) => ({
    type: item.type,
    src: item.src,
    title: item.title,
    alt: item.alt || item.title
  }));

  return (
    <section id="gallery" className="section gallery-section reveal-section">
      <div className="container">
        <SectionIntro
          kicker="Campus Moments"
          title="Photos and videos from our gallery"
          text="Classrooms, activity corners, outdoor play, celebrations, and newly uploaded moments stay together here."
        />
        <div className="gallery-filter" aria-label="Gallery categories">
          {availableCategories.map((category) => (
            <button className={activeCategory === category ? "active" : ""} key={category} type="button" onClick={() => setActiveCategory(category)}>
              {category}
            </button>
          ))}
        </div>
        <div className="gallery-grid">
          {visibleItems.map((item, index) => (
            <figure className="gallery-item reveal-item clickable-media" key={item.id} style={{ "--reveal-delay": `${index * 65}ms` }}>
              <button type="button" aria-label={`View ${item.title}`} onClick={() => onOpenViewer(viewerItems, index)}>
                {item.type === "video" ? (
                  <video src={item.src} muted playsInline preload="metadata" />
                ) : (
                  <img src={item.src} alt={item.alt || item.title} />
                )}
                <figcaption>{item.title}</figcaption>
              </button>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function MediaSection({ items, onOpenViewer }) {
  if (!items.length) {
    return null;
  }

  const viewerItems = items.map((item) => ({
    type: item.type,
    src: item.url,
    title: item.title,
    alt: item.alt || item.title
  }));

  return (
    <section className="section media-section reveal-section">
      <div className="container">
        <SectionIntro
          kicker="Photos & Videos"
          title="Fresh moments from StepUp"
          text="Recently shared classroom activities, celebrations, and playway learning moments."
        />
        <div className="media-grid">
          {items.map((item, index) => (
            <figure className="media-card reveal-item clickable-media" key={item.id} style={{ "--reveal-delay": `${index * 65}ms` }}>
              <button type="button" aria-label={`View ${item.title}`} onClick={() => onOpenViewer(viewerItems, index)}>
                {item.type === "video" ? (
                  <video src={item.url} muted preload="metadata" />
                ) : (
                  <img src={item.url} alt={item.alt || item.title} />
                )}
                <figcaption>{item.title}</figcaption>
              </button>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function MediaViewer({ viewer, onClose, onNext, onPrevious }) {
  if (!viewer.open || !viewer.items.length) {
    return null;
  }

  const item = viewer.items[viewer.index];
  const hasMultipleItems = viewer.items.length > 1;

  return (
    <div className="media-viewer" role="dialog" aria-modal="true" aria-label={item.title}>
      <button className="viewer-backdrop" type="button" aria-label="Close viewer" onClick={onClose} />
      <div className="viewer-shell">
        <button className="viewer-close" type="button" aria-label="Close viewer" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="viewer-media-wrap">
          {item.type === "video" ? (
            <video src={item.src} controls autoPlay />
          ) : (
            <img src={item.src} alt={item.alt || item.title} />
          )}
        </div>
        <div className="viewer-caption">
          <strong>{item.title}</strong>
          <span>{viewer.index + 1} / {viewer.items.length}</span>
        </div>
        {hasMultipleItems && (
          <>
            <button className="viewer-nav previous" type="button" aria-label="Previous media" onClick={onPrevious}>
              <ChevronLeft size={28} />
            </button>
            <button className="viewer-nav next" type="button" aria-label="Next media" onClick={onNext}>
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Events({ events, notices }) {
  return (
    <section className="section events-section reveal-section">
      <div className="container">
        <SectionIntro
          kicker="Upcoming Events"
          title="Learning beyond the classroom"
          text="Family days, discovery weeks, and celebrations invite children to participate with joy."
        />
        <div className="event-grid">
          {events.map((event, index) => (
            <article className="event-card reveal-item" key={event.title} style={{ "--reveal-delay": `${index * 85}ms` }}>
              <div className="event-date">
                <CalendarDays size={20} />
                <span>{event.date}</span>
              </div>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
            </article>
          ))}
        </div>
        {!!notices.length && (
          <div className="notice-panel reveal-item" style={{ "--reveal-delay": "160ms" }}>
            <SectionIntro
              kicker="Notices"
              title="Latest school updates"
              text="Important reminders, admission updates, and parent announcements from the admin team."
            />
            <div className="notice-list">
              {notices.map((notice, index) => (
                <article className="notice-card reveal-item" key={`${notice.title}-${notice.date}`} style={{ "--reveal-delay": `${index * 75}ms` }}>
                  <span>{notice.date}</span>
                  <h3>{notice.title}</h3>
                  <p>{notice.text}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Teachers({ teachers }) {
  if (!teachers.length) {
    return null;
  }

  return (
    <section className="section staff-section reveal-section">
      <div className="container">
        <SectionIntro
          kicker="Our Teachers"
          title="Warm mentors for every age group"
          text="Parents can meet the educators who guide routines, activities, confidence, and school readiness."
        />
        <div className="teacher-grid">
          {teachers.map((teacher, index) => (
            <article className="teacher-card reveal-item" key={teacher.name} style={{ "--reveal-delay": `${index * 80}ms` }}>
              <img src={teacher.image} alt={`${teacher.name}, ${teacher.role}`} />
              <div>
                <span>{teacher.experience}</span>
                <h3>{teacher.name}</h3>
                <strong>{teacher.role}</strong>
                <p>{teacher.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ testimonials }) {
  return (
    <section className="section muted-section reveal-section">
      <div className="container">
        <SectionIntro
          kicker="Parent Reviews"
          title="Families notice the StepUp difference"
          text="Google-style parent reviews help new families understand the school experience."
        />
        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <article className="testimonial-card reveal-item" key={testimonial.name} style={{ "--reveal-delay": `${index * 85}ms` }}>
              <div className="stars" aria-label={`${testimonial.rating ?? 5} star review`}>
                {Array.from({ length: testimonial.rating ?? 5 }).map((_, index) => (
                  <Star key={index} size={16} fill="currentColor" />
                ))}
              </div>
              <p>"{testimonial.quote}"</p>
              <strong>{testimonial.name}</strong>
              <span>{testimonial.role}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ faqs }) {
  if (!faqs.length) {
    return null;
  }

  return (
    <section id="faq" className="section faq-section reveal-section">
      <div className="container faq-layout">
        <div className="reveal-item">
          <SectionIntro
            kicker="FAQ"
            title="Answers parents usually need first"
            text="Quick details about age groups, visits, transport, updates, and admission documents."
          />
        </div>
        <div className="faq-list reveal-item" style={{ "--reveal-delay": "140ms" }}>
          {faqs.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary><HelpCircle size={18} /> {item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function MapSection({ map, contact }) {
  if (!map?.embedUrl) {
    return null;
  }

  return (
    <section className="section map-section reveal-section">
      <div className="container map-layout">
        <div className="map-copy reveal-item">
          <SectionIntro
            kicker="Find Us"
            title="Visit the StepUp campus"
            text="Use the map for directions before your school visit or admission counselling appointment."
          />
          <p>{contact.address}</p>
          <a className="button primary" href={map.directionsUrl} target="_blank" rel="noreferrer">
            Get Directions
            <MapPin size={18} />
          </a>
        </div>
        <div className="map-frame reveal-item" style={{ "--reveal-delay": "160ms" }}>
          <iframe title="StepUp Pre School location" src={map.embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </section>
  );
}

function WhatsAppButton({ contact }) {
  const href = createWhatsAppLink(contact.phone, "Hi StepUp Pre School, I want to know about admissions.");

  return (
    <a className="whatsapp-float" href={href} target="_blank" rel="noreferrer" aria-label="Chat with StepUp Pre School on WhatsApp">
      <MessageCircle size={21} />
      <span>WhatsApp</span>
    </a>
  );
}

function ContactSection({ contact, programs, socialLinks }) {
  const interests = useMemo(() => programs.map((program) => program.title), [programs]);

  return (
    <section id="contact" className="section contact-section reveal-section">
      <div className="container contact-layout">
        <div className="contact-copy reveal-item">
          <SectionIntro
            kicker="Book a Visit"
            title="Come see StepUp Pre School"
            text="Share a few details and the admissions team will call you to plan a school tour."
          />
          <div className="contact-list">
            <a className="reveal-item" href={`tel:${contact.phone.replace(/\s+/g, "")}`} style={{ "--reveal-delay": "110ms" }}>
              <Phone size={20} />
              <span>{contact.phone}</span>
            </a>
            <a className="reveal-item" href={`mailto:${contact.email}`} style={{ "--reveal-delay": "180ms" }}>
              <Mail size={20} />
              <span>{contact.email}</span>
            </a>
            <div className="reveal-item" style={{ "--reveal-delay": "250ms" }}>
              <MapPin size={20} />
              <span>{contact.address}</span>
            </div>
            <div className="reveal-item" style={{ "--reveal-delay": "320ms" }}>
              <Clock size={20} />
              <span>{contact.hours}</span>
            </div>
          </div>
          <SocialLinks links={socialLinks} className="contact-social-links" />
        </div>
        <EnquiryForm interests={interests} />
      </div>
    </section>
  );
}

function EnquiryForm({ interests }) {
  const [form, setForm] = useState({
    guardianName: "",
    phone: "",
    email: "",
    childName: "",
    childAge: "",
    interest: interests[0] ?? "",
    message: ""
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Sending your enquiry..." });

    try {
      const response = await requestJson("/api/enquiries", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setStatus({ type: "success", message: response.message });
      setForm({
        guardianName: "",
        phone: "",
        email: "",
        childName: "",
        childAge: "",
        interest: interests[0] ?? "",
        message: ""
      });
    } catch (requestError) {
      setStatus({ type: "error", message: requestError.message });
    }
  };

  return (
    <form className="enquiry-form reveal-item" style={{ "--reveal-delay": "140ms" }} onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Parent Name
          <input name="guardianName" value={form.guardianName} onChange={updateField} required />
        </label>
        <label>
          Phone Number
          <input name="phone" value={form.phone} onChange={updateField} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={updateField} />
        </label>
        <label>
          Child Name
          <input name="childName" value={form.childName} onChange={updateField} required />
        </label>
        <label>
          Child Age
          <input name="childAge" value={form.childAge} onChange={updateField} required />
        </label>
        <label>
          Program
          <select name="interest" value={form.interest} onChange={updateField} required>
            {interests.map((interest) => (
              <option key={interest} value={interest}>
                {interest}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Message
        <textarea name="message" value={form.message} onChange={updateField} rows="4" />
      </label>
      <button className="button primary form-submit" type="submit" disabled={status.type === "loading"}>
        {status.type === "loading" ? "Sending" : "Send Enquiry"}
        <Send size={18} />
      </button>
      {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}
    </form>
  );
}

function SiteFooter({ contact, socialLinks }) {
  return (
    <footer className="site-footer reveal-section">
      <div className="container footer-layout reveal-item">
        <a className="logo footer-logo" href="#top" aria-label="StepUp Pre School home">
          <span className="logo-icon" aria-hidden="true">
            <img className="logo-mark" src={creatorLogo} alt="" />
          </span>
          <span>
            <strong>StepUp</strong>
            <small>Pre School</small>
          </span>
        </a>
        <p>{contact.address}</p>
        <p>Admissions: {contact.phone}</p>
        <div className="creator-credit">
          <span>Designed & Developed by</span>
          <img src={creatorLogo} alt="Site creator logo" />
        </div>
        <SocialLinks links={socialLinks} className="footer-social-links" compact />
      </div>
    </footer>
  );
}

function SocialLinks({ links = {}, className = "", compact = false }) {
  const visibleLinks = socialPlatforms.filter((platform) => links?.[platform.key]);

  if (!visibleLinks.length) {
    return null;
  }

  return (
    <div className={`social-links ${className}`} aria-label="Social media links">
      {visibleLinks.map(({ key, label, Icon }) => (
        <a key={key} className="social-link" href={links[key]} target="_blank" rel="noreferrer" aria-label={label} title={label}>
          <Icon size={compact ? 17 : 19} />
          {!compact && <span>{label}</span>}
        </a>
      ))}
    </div>
  );
}

function SectionIntro({ kicker, title, text }) {
  return (
    <div className="section-intro">
      <span className="section-kicker">{kicker}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

export default PublicSite;
