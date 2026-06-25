import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Download,
  ImagePlus,
  Inbox,
  KeyRound,
  LogOut,
  RefreshCw,
  Save,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  Video
} from "lucide-react";
import {
  adminTabs,
  emptyEventForm,
  emptyFaq,
  emptyFeeItem,
  emptyLogin,
  emptyNoticeForm,
  emptyPasswordForm,
  emptyTeacher,
  emptyTestimonial,
  emptyUploadForm,
  enquiryStatuses
} from "./admin/adminConfig.js";
import AdminLogin from "./admin/AdminLogin.jsx";
import { storageKeys } from "./config/storageKeys.js";
import uploadedLogo from "./assets/my-logo.png";
import { authHeaders, requestJson } from "./services/apiClient.js";

function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.adminToken) || "");
  const [login, setLogin] = useState(emptyLogin);
  const [siteData, setSiteData] = useState(null);
  const [jsonText, setJsonText] = useState("");
  const [media, setMedia] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [uploadForm, setUploadForm] = useState(emptyUploadForm);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [noticeForm, setNoticeForm] = useState(emptyNoticeForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState("all");
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState("all");
  const [enquirySearch, setEnquirySearch] = useState("");

  const isLoggedIn = Boolean(token);

  useEffect(() => {
    if (isLoggedIn) {
      loadAdminData(token);
    }
  }, [isLoggedIn, token]);

  const galleryCount = useMemo(() => (siteData?.gallery?.length ?? 0) + (siteData?.media?.length ?? 0), [siteData]);
  const galleryCategories = useMemo(() => siteData?.galleryCategories ?? [], [siteData]);
  const filteredMedia = useMemo(() => {
    const query = mediaSearch.trim().toLowerCase();

    return media.filter((item) => {
      const matchesType = mediaTypeFilter === "all" || item.type === mediaTypeFilter;
      const matchesCategory = mediaCategoryFilter === "all" || (item.category || "Recent Uploads") === mediaCategoryFilter;
      const searchableText = `${item.title} ${item.alt} ${item.category} ${item.type}`.toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);

      return matchesType && matchesCategory && matchesSearch;
    });
  }, [media, mediaCategoryFilter, mediaSearch, mediaTypeFilter]);
  const filteredEnquiries = useMemo(() => {
    const query = enquirySearch.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const currentStatus = enquiry.status || "new";
      const matchesStatus = enquiryStatusFilter === "all" || currentStatus === enquiryStatusFilter;
      const searchableText = `${enquiry.guardianName} ${enquiry.phone} ${enquiry.email} ${enquiry.childName} ${enquiry.childAge} ${enquiry.interest} ${enquiry.message}`.toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [enquiries, enquirySearch, enquiryStatusFilter]);
  const enquiryStatusCounts = useMemo(() => {
    return enquiryStatuses.reduce((counts, enquiryStatus) => {
      counts[enquiryStatus] = enquiries.filter((enquiry) => (enquiry.status || "new") === enquiryStatus).length;
      return counts;
    }, {});
  }, [enquiries]);
  const adminMetrics = useMemo(() => {
    if (!siteData) {
      return [];
    }

    return [
      { label: "Gallery media", value: galleryCount, detail: `${media.length} uploaded`, tab: "media", Icon: ImagePlus },
      { label: "Enquiries", value: enquiries.length, detail: `${enquiryStatusCounts.new ?? 0} new`, tab: "enquiries", Icon: Inbox },
      { label: "Events & notices", value: (siteData.events?.length ?? 0) + (siteData.notices?.length ?? 0), detail: "Public updates", tab: "updates", Icon: CalendarDays },
      { label: "Feature content", value: (siteData.teachers?.length ?? 0) + (siteData.faqs?.length ?? 0) + (siteData.testimonials?.length ?? 0), detail: "Staff, FAQ, reviews", tab: "features", Icon: Sparkles }
    ];
  }, [enquiries.length, enquiryStatusCounts.new, galleryCount, media.length, siteData]);

  async function adminRequest(path, options = {}) {
    try {
      return await requestJson(path, {
        ...options,
        headers: {
          ...authHeaders(token),
          ...(options.headers ?? {})
        }
      });
    } catch (error) {
      if (error.status === 401) {
        handleLogout(false);
      }

      throw error;
    }
  }

  async function loadAdminData(currentToken = token) {
    setStatus({ type: "loading", message: "Loading admin data..." });

    try {
      const headers = authHeaders(currentToken);
      const [nextSiteData, nextMedia, nextEnquiries] = await Promise.all([
        requestJson("/api/admin/site", { headers }),
        requestJson("/api/admin/media", { headers }),
        requestJson("/api/admin/enquiries?limit=250", { headers })
      ]);

      setSiteData(nextSiteData);
      setJsonText(JSON.stringify(nextSiteData, null, 2));
      setMedia(nextMedia);
      setEnquiries(nextEnquiries.enquiries ?? []);
      setStatus({ type: "success", message: "Admin data loaded." });
    } catch (error) {
      handleLogout(false);
      setStatus({ type: "error", message: error.message });
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Logging in..." });

    try {
      const data = await requestJson("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(login)
      });

      localStorage.setItem(storageKeys.adminToken, data.token);
      setToken(data.token);
      setLogin(emptyLogin);
      setStatus({ type: "success", message: "Logged in." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function handleLogout(callApi = true) {
    if (callApi && token) {
      await requestJson("/api/admin/logout", {
        method: "POST",
        headers: authHeaders(token)
      }).catch(() => undefined);
    }

    localStorage.removeItem(storageKeys.adminToken);
    setToken("");
    setSiteData(null);
    setJsonText("");
    setMedia([]);
    setEnquiries([]);
  }

  function updateSiteSection(section, field, value) {
    setSiteData((current) => {
      const next = {
        ...current,
        [section]: {
          ...(current[section] ?? {}),
          [field]: value
        }
      };
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function updateSiteData(updater) {
    setSiteData((current) => {
      const next = updater(current);
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function updateSiteArrayItem(key, indexToUpdate, field, value) {
    updateSiteData((current) => ({
      ...current,
      [key]: (current[key] ?? []).map((item, index) => (index === indexToUpdate ? { ...item, [field]: value } : item))
    }));
  }

  function addSiteArrayItem(key, item) {
    updateSiteData((current) => ({ ...current, [key]: [...(current[key] ?? []), item] }));
    setStatus({ type: "success", message: "Item added. Save website data to publish it." });
  }

  function removeSiteArrayItem(key, indexToRemove) {
    updateSiteData((current) => ({ ...current, [key]: (current[key] ?? []).filter((_, index) => index !== indexToRemove) }));
    setStatus({ type: "success", message: "Item removed. Save website data to publish the change." });
  }

  function updateFeeItem(indexToUpdate, field, value) {
    updateSiteData((current) => ({
      ...current,
      fees: {
        ...(current.fees ?? {}),
        items: (current.fees?.items ?? []).map((item, index) => (index === indexToUpdate ? { ...item, [field]: value } : item))
      }
    }));
  }

  function addFeeItem() {
    updateSiteData((current) => ({
      ...current,
      fees: {
        ...(current.fees ?? {}),
        items: [...(current.fees?.items ?? []), emptyFeeItem]
      }
    }));
    setStatus({ type: "success", message: "Fee item added. Save website data to publish it." });
  }

  function removeFeeItem(indexToRemove) {
    updateSiteData((current) => ({
      ...current,
      fees: {
        ...(current.fees ?? {}),
        items: (current.fees?.items ?? []).filter((_, index) => index !== indexToRemove)
      }
    }));
    setStatus({ type: "success", message: "Fee item removed. Save website data to publish the change." });
  }

  function updateGalleryCategory(indexToUpdate, value) {
    updateSiteData((current) => ({
      ...current,
      galleryCategories: (current.galleryCategories ?? []).map((category, index) => (index === indexToUpdate ? value : category))
    }));
  }

  function addGalleryCategory() {
    updateSiteData((current) => ({ ...current, galleryCategories: [...(current.galleryCategories ?? []), "New Category"] }));
    setStatus({ type: "success", message: "Gallery category added. Save website data to publish it." });
  }

  function removeGalleryCategory(indexToRemove) {
    updateSiteData((current) => ({ ...current, galleryCategories: (current.galleryCategories ?? []).filter((_, index) => index !== indexToRemove) }));
    setStatus({ type: "success", message: "Gallery category removed. Save website data to publish the change." });
  }

  async function updateEnquiryStatus(id, nextStatus) {
    setStatus({ type: "loading", message: "Updating enquiry status..." });

    try {
      const response = await adminRequest(`/api/admin/enquiries/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus })
      });

      setEnquiries((current) => current.map((enquiry) => (enquiry.id === id ? response.enquiry : enquiry)));
      setStatus({ type: "success", message: "Enquiry status updated." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  function exportEnquiriesCsv() {
    const csvValue = (value) => `"${String(value ?? "").replace(/\r?\n/g, " ").replace(/"/g, '""')}"`;
    const headers = ["Status", "Parent", "Phone", "Email", "Child", "Age", "Program", "Message", "Created At"];
    const rows = filteredEnquiries.map((enquiry) => [
      enquiry.status || "new",
      enquiry.guardianName,
      enquiry.phone,
      enquiry.email,
      enquiry.childName,
      enquiry.childAge,
      enquiry.interest,
      enquiry.message,
      enquiry.createdAt
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(csvValue).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `stepup-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function saveSiteData() {
    setStatus({ type: "loading", message: "Saving website data..." });

    try {
      const parsedData = JSON.parse(jsonText);
      const response = await adminRequest("/api/admin/site", {
        method: "PUT",
        body: JSON.stringify(parsedData)
      });

      setSiteData(response.siteData);
      setJsonText(JSON.stringify(response.siteData, null, 2));
      setStatus({ type: "success", message: "Website data saved. Refresh the public site to see changes." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function uploadMedia(event) {
    event.preventDefault();

    if (!uploadForm.files.length) {
      setStatus({ type: "error", message: "Please choose one or more photos or videos." });
      return;
    }

    setStatus({ type: "loading", message: `Uploading ${uploadForm.files.length} media file${uploadForm.files.length === 1 ? "" : "s"}...` });

    try {
      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("alt", uploadForm.alt);
      formData.append("category", uploadForm.category);
      uploadForm.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await adminRequest("/api/admin/media", {
        method: "POST",
        body: formData
      });

      const uploadedMedia = Array.isArray(response.media) ? response.media : [response.media].filter(Boolean);

      setMedia((current) => [...uploadedMedia, ...current]);
      setSiteData((current) => {
        const next = { ...current, media: [...uploadedMedia, ...(current.media ?? [])] };
        setJsonText(JSON.stringify(next, null, 2));
        return next;
      });
      setUploadForm(emptyUploadForm);
      event.target.reset();
      setStatus({ type: "success", message: `${uploadedMedia.length} media file${uploadedMedia.length === 1 ? "" : "s"} uploaded and added to the gallery.` });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  function addEvent(event) {
    event.preventDefault();

    if (!eventForm.date || !eventForm.title || !eventForm.description) {
      setStatus({ type: "error", message: "Please complete event date, title, and description." });
      return;
    }

    updateSiteData((current) => ({ ...current, events: [...(current.events ?? []), eventForm] }));
    setEventForm(emptyEventForm);
    setStatus({ type: "success", message: "Event added. Save website data to publish it." });
  }

  function removeEvent(indexToRemove) {
    updateSiteData((current) => ({ ...current, events: (current.events ?? []).filter((_, index) => index !== indexToRemove) }));
    setStatus({ type: "success", message: "Event removed. Save website data to publish the change." });
  }

  function addNotice(event) {
    event.preventDefault();

    if (!noticeForm.date || !noticeForm.title || !noticeForm.text) {
      setStatus({ type: "error", message: "Please complete notice date, title, and text." });
      return;
    }

    updateSiteData((current) => ({ ...current, notices: [...(current.notices ?? []), noticeForm] }));
    setNoticeForm(emptyNoticeForm);
    setStatus({ type: "success", message: "Notice added. Save website data to publish it." });
  }

  function removeNotice(indexToRemove) {
    updateSiteData((current) => ({ ...current, notices: (current.notices ?? []).filter((_, index) => index !== indexToRemove) }));
    setStatus({ type: "success", message: "Notice removed. Save website data to publish the change." });
  }

  async function deleteMedia(id) {
    setStatus({ type: "loading", message: "Deleting media..." });

    try {
      await adminRequest(`/api/admin/media/${id}`, { method: "DELETE" });
      setMedia((current) => current.filter((item) => item.id !== id));
      setSiteData((current) => {
        const next = { ...current, media: (current.media ?? []).filter((item) => item.id !== id) };
        setJsonText(JSON.stringify(next, null, 2));
        return next;
      });
      setStatus({ type: "success", message: "Media deleted." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function updatePassword(event) {
    event.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      setStatus({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatus({ type: "error", message: "New password and confirmation do not match." });
      return;
    }

    setStatus({ type: "loading", message: "Updating admin password..." });

    try {
      const response = await adminRequest("/api/admin/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      setPasswordForm(emptyPasswordForm);
      setStatus({ type: "success", message: `${response.message} Use the new password next time you login.` });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  if (!isLoggedIn) {
    return <AdminLogin login={login} setLogin={setLogin} status={status} onSubmit={handleLogin} />;
  }

  return (
    <main className="admin-page">
      <header className="admin-header admin-command-header">
        <div className="admin-header-copy">
          <img className="admin-logo-mark compact" src={uploadedLogo} alt="StepUp Pre School" />
          <a className="admin-back-link" href="/">
            Back to website
          </a>
          <span className="admin-eyebrow">Command Center</span>
          <h1>StepUp Admin Studio</h1>
          <p>Manage admissions, gallery, website content, notices, reviews, and public feature blocks from one polished workspace.</p>
        </div>
        <div className="admin-header-actions">
          <a className="button light" href="/" target="_blank" rel="noreferrer">
            Preview Site
          </a>
          <button className="button light" type="button" onClick={() => loadAdminData()}>
            <RefreshCw size={18} />
            Refresh
          </button>
          <button className="button primary" type="button" onClick={() => handleLogout()}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Admin sections">
        {adminTabs.map(({ id, label, Icon }) => (
          <button className={activeTab === id ? "active" : ""} key={id} type="button" onClick={() => setActiveTab(id)}>
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {status.message && <p className={`admin-status ${status.type}`}>{status.message}</p>}

      {activeTab === "dashboard" && siteData && (
        <section className="admin-dashboard">
          <div className="admin-metric-grid">
            {adminMetrics.map(({ label, value, detail, tab, Icon }) => (
              <button className="admin-metric-card" key={label} type="button" onClick={() => setActiveTab(tab)}>
                <Icon size={22} />
                <strong>{value}</strong>
                <span>{label}</span>
                <small>{detail}</small>
              </button>
            ))}
          </div>

          <div className="admin-dashboard-panels">
            <article className="admin-card admin-command-card">
              <div className="admin-card-title-row">
                <h2>Quick Actions</h2>
                <Settings size={22} />
              </div>
              <div className="admin-action-grid">
                <button type="button" onClick={() => setActiveTab("media")}><ImagePlus size={18} /> Upload Gallery Media</button>
                <button type="button" onClick={() => setActiveTab("updates")}><CalendarDays size={18} /> Add Event or Notice</button>
                <button type="button" onClick={() => setActiveTab("features")}><Sparkles size={18} /> Edit New Features</button>
                <button type="button" onClick={() => setActiveTab("enquiries")}><Inbox size={18} /> Review Enquiries</button>
              </div>
            </article>

            <article className="admin-card admin-command-card">
              <div className="admin-card-title-row">
                <h2>Enquiry Pipeline</h2>
                <BarChart3 size={22} />
              </div>
              <div className="admin-pipeline-grid">
                {enquiryStatuses.map((enquiryStatus) => (
                  <button key={enquiryStatus} type="button" onClick={() => { setEnquiryStatusFilter(enquiryStatus); setActiveTab("enquiries"); }}>
                    <strong>{enquiryStatusCounts[enquiryStatus] ?? 0}</strong>
                    <span>{enquiryStatus}</span>
                  </button>
                ))}
              </div>
            </article>

            <article className="admin-card admin-command-card">
              <div className="admin-card-title-row">
                <h2>Content Health</h2>
                <ClipboardList size={22} />
              </div>
              <div className="admin-health-list">
                <span>{siteData.programs?.length ?? 0} learning programs</span>
                <span>{siteData.teachers?.length ?? 0} teacher profiles</span>
                <span>{siteData.testimonials?.length ?? 0} parent reviews</span>
                <span>{siteData.faqs?.length ?? 0} FAQ answers</span>
                <span>{siteData.galleryCategories?.length ?? 0} gallery categories</span>
              </div>
            </article>

            <article className="admin-card admin-command-card">
              <div className="admin-card-title-row">
                <h2>Latest Enquiries</h2>
                <Inbox size={22} />
              </div>
              <div className="admin-compact-feed">
                {enquiries.slice(0, 4).map((enquiry) => (
                  <button key={enquiry.id} type="button" onClick={() => setActiveTab("enquiries")}>
                    <strong>{enquiry.guardianName}</strong>
                    <span>{enquiry.childName} - {enquiry.status || "new"}</span>
                  </button>
                ))}
                {!enquiries.length && <p className="empty-state">No enquiries yet.</p>}
              </div>
            </article>
          </div>
        </section>
      )}

      {activeTab === "content" && siteData && (
        <section className="admin-panel-grid">
          <div className="admin-card">
            <h2>Quick Edit</h2>
            <div className="admin-form-grid">
              <label>
                Hero Title
                <input value={siteData.hero.title} onChange={(event) => updateSiteSection("hero", "title", event.target.value)} />
              </label>
              <label>
                Hero Kicker
                <input value={siteData.hero.kicker} onChange={(event) => updateSiteSection("hero", "kicker", event.target.value)} />
              </label>
              <label className="wide-field">
                Hero Subtitle
                <textarea value={siteData.hero.subtitle} onChange={(event) => updateSiteSection("hero", "subtitle", event.target.value)} rows="3" />
              </label>
              <label>
                Phone
                <input value={siteData.contact.phone} onChange={(event) => updateSiteSection("contact", "phone", event.target.value)} />
              </label>
              <label>
                Email
                <input value={siteData.contact.email} onChange={(event) => updateSiteSection("contact", "email", event.target.value)} />
              </label>
              <label className="wide-field">
                Address
                <textarea value={siteData.contact.address} onChange={(event) => updateSiteSection("contact", "address", event.target.value)} rows="3" />
              </label>
              <label>
                School Hours
                <input value={siteData.contact.hours} onChange={(event) => updateSiteSection("contact", "hours", event.target.value)} />
              </label>
              <label>
                Google Business Link
                <input value={siteData.socialLinks?.googleBusiness ?? ""} onChange={(event) => updateSiteSection("socialLinks", "googleBusiness", event.target.value)} />
              </label>
              <label>
                Facebook Link
                <input value={siteData.socialLinks?.facebook ?? ""} onChange={(event) => updateSiteSection("socialLinks", "facebook", event.target.value)} />
              </label>
              <label>
                Instagram Link
                <input value={siteData.socialLinks?.instagram ?? ""} onChange={(event) => updateSiteSection("socialLinks", "instagram", event.target.value)} />
              </label>
              <label>
                YouTube Link
                <input value={siteData.socialLinks?.youtube ?? ""} onChange={(event) => updateSiteSection("socialLinks", "youtube", event.target.value)} />
              </label>
              <label>
                Gallery Media
                <input value={`${galleryCount} items`} readOnly />
              </label>
            </div>
          </div>

          <div className="admin-card json-card">
            <h2>Full Website JSON</h2>
            <textarea value={jsonText} onChange={(event) => setJsonText(event.target.value)} rows="22" spellCheck="false" />
            <button className="button primary" type="button" onClick={saveSiteData}>
              <Save size={18} />
              Save Website Data
            </button>
          </div>
        </section>
      )}

      {activeTab === "features" && siteData && (
        <section className="admin-feature-grid">
          <div className="admin-card feature-admin-card">
            <h2>Fees & Brochure</h2>
            <div className="admin-form-grid">
              <label>
                Brochure Title
                <input value={siteData.brochure?.title ?? ""} onChange={(event) => updateSiteSection("brochure", "title", event.target.value)} />
              </label>
              <label>
                Brochure Description
                <input value={siteData.brochure?.description ?? ""} onChange={(event) => updateSiteSection("brochure", "description", event.target.value)} />
              </label>
              <label className="wide-field">
                Fee Note
                <textarea value={siteData.fees?.note ?? ""} onChange={(event) => updateSiteSection("fees", "note", event.target.value)} rows="3" />
              </label>
            </div>
            <div className="admin-edit-list">
              {(siteData.fees?.items ?? []).map((item, index) => (
                <article className="admin-edit-item" key={`${item.title}-${index}`}>
                  <div className="admin-form-grid">
                    <label>
                      Title
                      <input value={item.title} onChange={(event) => updateFeeItem(index, "title", event.target.value)} />
                    </label>
                    <label>
                      Amount
                      <input value={item.amount} onChange={(event) => updateFeeItem(index, "amount", event.target.value)} />
                    </label>
                    <label className="wide-field">
                      Description
                      <textarea value={item.description} onChange={(event) => updateFeeItem(index, "description", event.target.value)} rows="2" />
                    </label>
                  </div>
                  <button className="icon-danger" type="button" aria-label={`Remove ${item.title}`} onClick={() => removeFeeItem(index)}>
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
            <button className="button light" type="button" onClick={addFeeItem}>Add Fee Item</button>
          </div>

          <div className="admin-card feature-admin-card">
            <h2>Gallery Categories & Map</h2>
            <div className="admin-edit-list compact">
              {(siteData.galleryCategories ?? []).map((category, index) => (
                <article className="admin-edit-item compact" key={`${category}-${index}`}>
                  <label>
                    Category
                    <input value={category} onChange={(event) => updateGalleryCategory(index, event.target.value)} />
                  </label>
                  <button className="icon-danger" type="button" aria-label={`Remove ${category}`} onClick={() => removeGalleryCategory(index)}>
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
            <button className="button light" type="button" onClick={addGalleryCategory}>Add Gallery Category</button>
            <div className="admin-form-grid">
              <label className="wide-field">
                Google Map Embed URL
                <input value={siteData.map?.embedUrl ?? ""} onChange={(event) => updateSiteSection("map", "embedUrl", event.target.value)} />
              </label>
              <label className="wide-field">
                Directions URL
                <input value={siteData.map?.directionsUrl ?? ""} onChange={(event) => updateSiteSection("map", "directionsUrl", event.target.value)} />
              </label>
            </div>
          </div>

          <div className="admin-card feature-admin-card">
            <h2>Teacher Profiles</h2>
            <div className="admin-edit-list">
              {(siteData.teachers ?? []).map((teacher, index) => (
                <article className="admin-edit-item" key={`${teacher.name}-${index}`}>
                  <div className="admin-form-grid">
                    <label>
                      Name
                      <input value={teacher.name} onChange={(event) => updateSiteArrayItem("teachers", index, "name", event.target.value)} />
                    </label>
                    <label>
                      Role
                      <input value={teacher.role} onChange={(event) => updateSiteArrayItem("teachers", index, "role", event.target.value)} />
                    </label>
                    <label>
                      Experience
                      <input value={teacher.experience} onChange={(event) => updateSiteArrayItem("teachers", index, "experience", event.target.value)} />
                    </label>
                    <label>
                      Image URL
                      <input value={teacher.image} onChange={(event) => updateSiteArrayItem("teachers", index, "image", event.target.value)} />
                    </label>
                    <label className="wide-field">
                      Bio
                      <textarea value={teacher.bio} onChange={(event) => updateSiteArrayItem("teachers", index, "bio", event.target.value)} rows="2" />
                    </label>
                  </div>
                  <button className="icon-danger" type="button" aria-label={`Remove ${teacher.name}`} onClick={() => removeSiteArrayItem("teachers", index)}>
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
            <button className="button light" type="button" onClick={() => addSiteArrayItem("teachers", emptyTeacher)}>Add Teacher</button>
          </div>

          <div className="admin-card feature-admin-card">
            <h2>Parent Reviews</h2>
            <div className="admin-edit-list">
              {(siteData.testimonials ?? []).map((testimonial, index) => (
                <article className="admin-edit-item" key={`${testimonial.name}-${index}`}>
                  <div className="admin-form-grid">
                    <label>
                      Parent Name
                      <input value={testimonial.name} onChange={(event) => updateSiteArrayItem("testimonials", index, "name", event.target.value)} />
                    </label>
                    <label>
                      Role
                      <input value={testimonial.role} onChange={(event) => updateSiteArrayItem("testimonials", index, "role", event.target.value)} />
                    </label>
                    <label>
                      Rating
                      <input type="number" min="1" max="5" value={testimonial.rating ?? 5} onChange={(event) => updateSiteArrayItem("testimonials", index, "rating", Number(event.target.value))} />
                    </label>
                    <label className="wide-field">
                      Quote
                      <textarea value={testimonial.quote} onChange={(event) => updateSiteArrayItem("testimonials", index, "quote", event.target.value)} rows="3" />
                    </label>
                  </div>
                  <button className="icon-danger" type="button" aria-label={`Remove ${testimonial.name}`} onClick={() => removeSiteArrayItem("testimonials", index)}>
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
            <button className="button light" type="button" onClick={() => addSiteArrayItem("testimonials", emptyTestimonial)}>Add Review</button>
          </div>

          <div className="admin-card feature-admin-card">
            <h2>FAQ</h2>
            <div className="admin-edit-list">
              {(siteData.faqs ?? []).map((faq, index) => (
                <article className="admin-edit-item" key={`${faq.question}-${index}`}>
                  <div className="admin-form-grid">
                    <label className="wide-field">
                      Question
                      <input value={faq.question} onChange={(event) => updateSiteArrayItem("faqs", index, "question", event.target.value)} />
                    </label>
                    <label className="wide-field">
                      Answer
                      <textarea value={faq.answer} onChange={(event) => updateSiteArrayItem("faqs", index, "answer", event.target.value)} rows="3" />
                    </label>
                  </div>
                  <button className="icon-danger" type="button" aria-label={`Remove ${faq.question}`} onClick={() => removeSiteArrayItem("faqs", index)}>
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
            <button className="button light" type="button" onClick={() => addSiteArrayItem("faqs", emptyFaq)}>Add FAQ</button>
          </div>

          <div className="admin-card updates-save-card">
            <h2>Publish Feature Changes</h2>
            <p>These controls update the website data draft. Save to publish brochure, fee, gallery category, teacher, review, FAQ, and map changes.</p>
            <button className="button primary" type="button" onClick={saveSiteData}>
              <Save size={18} />
              Save New Features
            </button>
          </div>
        </section>
      )}

      {activeTab === "media" && (
        <section className="admin-panel-grid">
          <form className="admin-card upload-card" onSubmit={uploadMedia}>
            <h2>Upload Photos or Videos to Gallery</h2>
            <label>
              Title
              <input value={uploadForm.title} onChange={(event) => setUploadForm((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <label>
              Alt Text
              <input value={uploadForm.alt} onChange={(event) => setUploadForm((current) => ({ ...current, alt: event.target.value }))} />
            </label>
            <label>
              Gallery Category
              <input
                list="gallery-category-options"
                value={uploadForm.category}
                onChange={(event) => setUploadForm((current) => ({ ...current, category: event.target.value }))}
                placeholder="Classroom, Events, Outdoor Play"
              />
              <datalist id="gallery-category-options">
                {["Recent Uploads", ...galleryCategories].map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>
            <label>
              Files
              <input
                type="file"
                accept="image/*,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={(event) => setUploadForm((current) => ({ ...current, files: Array.from(event.target.files ?? []) }))}
                required
              />
              <span className="file-hint">
                {uploadForm.files.length ? `${uploadForm.files.length} file${uploadForm.files.length === 1 ? "" : "s"} selected` : "You can select multiple photos and videos together."}
              </span>
            </label>
            <button className="button primary" type="submit">
              <Upload size={18} />
              Upload to Gallery
            </button>
          </form>

          <div className="admin-card media-manager">
            <div className="admin-card-title-row">
              <h2>Uploaded Media</h2>
              <span className="admin-count-pill">{filteredMedia.length} shown</span>
            </div>
            <div className="admin-filter-bar">
              <label>
                <Search size={17} />
                <input value={mediaSearch} onChange={(event) => setMediaSearch(event.target.value)} placeholder="Search media" />
              </label>
              <select value={mediaTypeFilter} onChange={(event) => setMediaTypeFilter(event.target.value)}>
                <option value="all">All types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
              <select value={mediaCategoryFilter} onChange={(event) => setMediaCategoryFilter(event.target.value)}>
                <option value="all">All categories</option>
                {["Recent Uploads", ...galleryCategories].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="admin-media-list">
              {filteredMedia.map((item) => (
                <article className="admin-media-item" key={item.id}>
                  {item.type === "video" ? <Video size={30} /> : <ImagePlus size={30} />}
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.category || "Recent Uploads"} - {item.type} - {new Date(item.createdAt).toLocaleDateString()}</span>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      Open file
                    </a>
                  </div>
                  <button className="icon-danger" type="button" aria-label={`Delete ${item.title}`} onClick={() => deleteMedia(item.id)}>
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
              {!filteredMedia.length && <p className="empty-state">No media matches your filters.</p>}
            </div>
          </div>
        </section>
      )}

      {activeTab === "updates" && siteData && (
        <section className="admin-panel-grid updates-admin-grid">
          <div className="admin-card">
            <h2>Add Event</h2>
            <form className="admin-stacked-form" onSubmit={addEvent}>
              <label>
                Date
                <input value={eventForm.date} onChange={(event) => setEventForm((current) => ({ ...current, date: event.target.value }))} placeholder="Jul 12" />
              </label>
              <label>
                Title
                <input value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label>
                Description
                <textarea value={eventForm.description} onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))} rows="3" />
              </label>
              <button className="button primary" type="submit">
                Add Event
              </button>
            </form>
            <div className="admin-mini-list">
              {(siteData.events ?? []).map((event, index) => (
                <article className="admin-mini-item" key={`${event.title}-${index}`}>
                  <div>
                    <strong>{event.title}</strong>
                    <span>{event.date}</span>
                    <p>{event.description}</p>
                  </div>
                  <button className="icon-danger" type="button" aria-label={`Remove ${event.title}`} onClick={() => removeEvent(index)}>
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <h2>Add Notice</h2>
            <form className="admin-stacked-form" onSubmit={addNotice}>
              <label>
                Date
                <input value={noticeForm.date} onChange={(event) => setNoticeForm((current) => ({ ...current, date: event.target.value }))} placeholder="Now" />
              </label>
              <label>
                Title
                <input value={noticeForm.title} onChange={(event) => setNoticeForm((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label>
                Text
                <textarea value={noticeForm.text} onChange={(event) => setNoticeForm((current) => ({ ...current, text: event.target.value }))} rows="3" />
              </label>
              <button className="button primary" type="submit">
                Add Notice
              </button>
            </form>
            <div className="admin-mini-list">
              {(siteData.notices ?? []).map((notice, index) => (
                <article className="admin-mini-item" key={`${notice.title}-${index}`}>
                  <div>
                    <strong>{notice.title}</strong>
                    <span>{notice.date}</span>
                    <p>{notice.text}</p>
                  </div>
                  <button className="icon-danger" type="button" aria-label={`Remove ${notice.title}`} onClick={() => removeNotice(index)}>
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className="admin-card updates-save-card">
            <h2>Publish Changes</h2>
            <p>Events and notices update the website data draft. Save to publish them on the public site.</p>
            <button className="button primary" type="button" onClick={saveSiteData}>
              <Save size={18} />
              Save Events & Notices
            </button>
          </div>
        </section>
      )}

      {activeTab === "enquiries" && (
        <section className="admin-card enquiries-card">
          <div className="admin-card-title-row">
            <h2>Latest Enquiries</h2>
            <button className="button light" type="button" onClick={exportEnquiriesCsv} disabled={!filteredEnquiries.length}>
              <Download size={18} />
              Export CSV
            </button>
          </div>
          <div className="admin-filter-bar enquiry-filter-bar">
            <label>
              <Search size={17} />
              <input value={enquirySearch} onChange={(event) => setEnquirySearch(event.target.value)} placeholder="Search parent, phone, child, program" />
            </label>
            <select value={enquiryStatusFilter} onChange={(event) => setEnquiryStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              {enquiryStatuses.map((enquiryStatus) => (
                <option key={enquiryStatus} value={enquiryStatus}>{enquiryStatus}</option>
              ))}
            </select>
            <span className="admin-count-pill">{filteredEnquiries.length} shown</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Parent</th>
                  <th>Phone</th>
                  <th>Child</th>
                  <th>Program</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.id}>
                    <td>
                      <select className="status-select" value={enquiry.status || "new"} onChange={(event) => updateEnquiryStatus(enquiry.id, event.target.value)}>
                        {enquiryStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>{enquiry.guardianName}</td>
                    <td>{enquiry.phone}</td>
                    <td>{enquiry.childName} ({enquiry.childAge})</td>
                    <td>{enquiry.interest}</td>
                    <td>{enquiry.message || "-"}</td>
                    <td>{new Date(enquiry.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredEnquiries.length && <p className="empty-state">No enquiries match your filters.</p>}
          </div>
        </section>
      )}

      {activeTab === "password" && (
        <form className="admin-card password-card" onSubmit={updatePassword}>
          <div className="password-card-header">
            <KeyRound size={30} />
            <div>
              <h2>Reset Admin Password</h2>
              <p>Use this to change the password for the admin panel login.</p>
            </div>
          </div>
          <label>
            Current Password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
              required
            />
          </label>
          <label>
            New Password
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
              minLength="8"
              required
            />
          </label>
          <label>
            Confirm New Password
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              minLength="8"
              required
            />
          </label>
          <button className="button primary" type="submit">
            <KeyRound size={18} />
            Update Password
          </button>
        </form>
      )}
    </main>
  );
}

export default AdminPanel;