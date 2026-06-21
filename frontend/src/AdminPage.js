import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminPage.css";

function AdminPage({ onLogout, currentUser }) {
  const API_BASE = "http://127.0.0.1:8000";

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [message, setMessage] = useState("");
  const [token] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeResults, setScrapeResults] = useState(null);

  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    source_url: "",
    venue_id: "",
    organization_id: "",
    category_id: "",
    status: "pending"
  });

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  });

  const fetchMeta = async () => {
    try {
      const [catRes, venueRes, orgRes] = await Promise.all([
        fetch(`${API_BASE}/meta/categories`),
        fetch(`${API_BASE}/meta/venues`),
        fetch(`${API_BASE}/meta/organizations`)
      ]);

      const [catData, venueData, orgData] = await Promise.all([
        catRes.json(),
        venueRes.json(),
        orgRes.json()
      ]);

      setCategories(Array.isArray(catData) ? catData : []);
      setVenues(Array.isArray(venueData) ? venueData : []);
      setOrganizations(Array.isArray(orgData) ? orgData : []);
    } catch (err) {
      console.error("Failed to load metadata", err);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/events?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch admin events");
      }

      const data = await res.json();
      const safeData = Array.isArray(data) ? data : [];
      setEvents(safeData);

      if (safeData.length > 0) {
        const stillExists = safeData.some((e) => e.id === selectedEventId);
        if (!selectedEventId || !stillExists) {
          setSelectedEventId(safeData[0].id);
        }
      } else {
        setSelectedEventId(null);
      }
    } catch (err) {
      console.error(err);
      setMessage("Could not load admin events. Make sure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMeta();
      fetchEvents();
    }
  }, [token]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  useEffect(() => {
    if (!selectedEvent) return;

    setForm({
      title: selectedEvent.title || "",
      description: selectedEvent.description || "",
      start_time: toDateTimeLocal(selectedEvent.start_time),
      end_time: toDateTimeLocal(selectedEvent.end_time),
      source_url: selectedEvent.source_url || "",
      venue_id: selectedEvent.venue_id?.toString?.() || "",
      organization_id: selectedEvent.organization_id?.toString?.() || "",
      category_id: selectedEvent.category_id?.toString?.() || "",
      status: selectedEvent.status || "pending"
    });
  }, [selectedEvent]);

  function toDateTimeLocal(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return;

    try {
      setMessage("");

      const payload = {
        title: form.title,
        description: form.description,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        source_url: form.source_url || null,
        venue_id: form.venue_id ? Number(form.venue_id) : null,
        organization_id: form.organization_id ? Number(form.organization_id) : null,
        category_id: form.category_id ? Number(form.category_id) : null
      };

      const res = await fetch(`${API_BASE}/events/${selectedEventId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update event");
      }

      setMessage("Event updated successfully.");
      await fetchEvents();
    } catch (err) {
      console.error(err);
      setMessage("Could not update event.");
    }
  };

  const handleDelete = async () => {
    if (!selectedEventId) return;

    try {
      const res = await fetch(`${API_BASE}/events/${selectedEventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to delete event");
      }

      setMessage("Event deleted.");
      const remaining = events.filter((e) => e.id !== selectedEventId);
      setEvents(remaining);
      setSelectedEventId(remaining[0]?.id || null);
    } catch (err) {
      console.error(err);
      setMessage("Could not delete event.");
    }
  };

  const handlePublish = async (isPublished) => {
    if (!selectedEventId) return;

    try {
      const res = await fetch(`${API_BASE}/events/${selectedEventId}/publish`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          is_published: isPublished,
          status: isPublished ? "approved" : "pending"
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to change publish state");
      }

      setMessage(isPublished ? "Event published." : "Event unpublished.");
      await fetchEvents();
    } catch (err) {
      console.error(err);
      setMessage("Could not update publish status.");
    }
  };

  const pendingCount = events.filter((e) => !e.is_published).length;

  const runScrapers = async (dry) => {
    if (!token) {
      setMessage("Admin token missing");
      return;
    }
    setScrapeLoading(true);
    setScrapeResults(null);
    setMessage("");
    try {
      const url = `${API_BASE}/admin/scrape${dry ? "?dry_run=true" : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Request failed ${res.status}`);
      }
      const data = await res.json();
      setScrapeResults(data);
      setMessage("Scrape completed.");
      // refresh events after successful run
      await fetchEvents();
    } catch (err) {
      console.error(err);
      setMessage(`Scrape failed: ${err.message}`);
    } finally {
      setScrapeLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <nav className="admin-top-nav">
        <div className="admin-brand">KalenderNetz</div>

        <div className="admin-nav-links">
          <Link to="/" className="admin-nav-btn">Home</Link>
          <Link to="/calendar" className="admin-nav-btn">Calendar</Link>
          <Link to="/browse" className="admin-nav-btn">Browse</Link>
          <Link to="/venues" className="admin-nav-btn">Venues</Link>
          <Link to="/organizations" className="admin-nav-btn">Organizations</Link>
          <Link to="/submit-event" className="admin-nav-btn">Submit Event</Link>
          <Link to="/admin" className="admin-nav-btn admin-nav-btn-active">Admin</Link>
        </div>
      </nav>

      <div className="admin-shell">
        <div className="admin-hero">
          <h1>Admin Dashboard</h1>
          <p>
            Welcome {currentUser?.username || "admin"}. Pending submissions: {pendingCount}
          </p>
        </div>

        <div className="admin-token-row">
          <button className="admin-refresh-btn" onClick={fetchEvents}>
            Refresh
          </button>
          <button
            className="admin-refresh-btn"
            onClick={() => runScrapers(false)}
            disabled={!token || scrapeLoading}
          >
            Run Scrapers
          </button>
          <button
            className="admin-refresh-btn"
            onClick={() => runScrapers(true)}
            disabled={!token || scrapeLoading}
          >
            Check CSVs (dry)
          </button>
          <button className="admin-logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>

        {message && <div className="admin-message">{message}</div>}
        {scrapeLoading && <div className="admin-message">Running scrapers...</div>}
        {scrapeResults && (
          <div className="admin-message">
            <strong>Scrape results:</strong>
            <pre style={{ whiteSpace: "pre-wrap", maxHeight: 240, overflow: "auto" }}>
              {JSON.stringify(scrapeResults, null, 2)}
            </pre>
          </div>
        )}

        <div className="admin-main-grid">
          <section className="admin-list-card">
            <div className="admin-card-header">
              <h2>All Events</h2>
              <span className="admin-count-pill">{events.length} total</span>
            </div>

            <div className="admin-event-list">
              {loading ? (
                <p>Loading...</p>
              ) : events.length === 0 ? (
                <p>No events found.</p>
              ) : (
                events.map((event) => (
                  <button
                    key={event.id}
                    className={`admin-event-item ${
                      selectedEventId === event.id ? "admin-event-item-selected" : ""
                    }`}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <div className="admin-event-item-top">
                      <h3>{event.title}</h3>
                      <span
                        className={`admin-status-pill ${
                          event.is_published ? "admin-status-published" : "admin-status-pending"
                        }`}
                      >
                        {event.is_published ? "Published" : "Pending"}
                      </span>
                    </div>

                    <p className="admin-event-item-meta">
                      {event.category || "Event"} • {event.venue || "Unknown venue"}
                    </p>
                    <p className="admin-event-item-location">
                      {event.organization || "No organization"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="admin-editor-card">
            <div className="admin-editor-header">
              <h2>Edit selected event</h2>

              <div className="admin-editor-actions">
                <button
                  type="button"
                  className="admin-pill-btn admin-pill-green"
                  onClick={() => handlePublish(true)}
                  disabled={!selectedEventId}
                >
                  Publish
                </button>
                <button
                  type="button"
                  className="admin-pill-btn"
                  onClick={() => handlePublish(false)}
                  disabled={!selectedEventId}
                >
                  Unpublish
                </button>
                <button
                  type="button"
                  className="admin-pill-btn admin-pill-red"
                  onClick={handleDelete}
                  disabled={!selectedEventId}
                >
                  Delete
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="admin-form">
              <input
                className="admin-input"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Event title"
              />

              <textarea
                className="admin-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Event description"
              />

              <div className="admin-two-col">
                <input
                  className="admin-input"
                  type="datetime-local"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                />
                <input
                  className="admin-input"
                  type="datetime-local"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-two-col">
                <select
                  className="admin-input"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  className="admin-input"
                  name="venue_id"
                  value={form.venue_id}
                  onChange={handleChange}
                >
                  <option value="">Select venue</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-two-col">
                <select
                  className="admin-input"
                  name="organization_id"
                  value={form.organization_id}
                  onChange={handleChange}
                >
                  <option value="">Select organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>

                <input
                  className="admin-input"
                  name="source_url"
                  value={form.source_url}
                  onChange={handleChange}
                  placeholder="Source URL"
                />
              </div>

              <input
                className="admin-input"
                name="status"
                value={form.status}
                onChange={handleChange}
                placeholder="Status"
              />

              <button className="admin-save-btn" type="submit" disabled={!selectedEventId}>
                Save Changes
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;