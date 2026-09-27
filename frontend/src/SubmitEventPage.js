import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SubmitEventPage.css';

function SubmitEventPage({ onLogout, currentUser }) {
  const API_BASE = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('token') || '';

  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    source_url: '',
    venue_id: '',
    organization_id: '',
    category_id: ''
  });

  useEffect(() => {
    const loadMeta = async () => {
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
        console.error(err);
        setMessage('Could not load categories, venues, or organizations.');
      } finally {
        setLoadingMeta(false);
      }
    };

    loadMeta();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          start_time: form.start_time,
          end_time: form.end_time || null,
          source_url: form.source_url || null,
          venue_id: form.venue_id ? Number(form.venue_id) : null,
          organization_id: form.organization_id ? Number(form.organization_id) : null,
          category_id: form.category_id ? Number(form.category_id) : null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to submit event');
      }

      setMessage('Event submitted successfully. It is now pending admin review.');
      setForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        source_url: '',
        venue_id: '',
        organization_id: '',
        category_id: ''
      });
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Failed to submit event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="submit-page">
      <nav className="top-nav">
        <div className="nav-content">
          <h1 className="nav-logo">KalenderNetz</h1>

          <div className="nav-links">
            <Link to="/calendar" className="nav-link">Calendar</Link>
            <Link to="/browse" className="nav-link">Browse</Link>
            <Link to="/venues" className="nav-link">Venues</Link>
            <Link to="/organizations" className="nav-link">Organizations</Link>
            <Link to="/submit-event" className="nav-link active">Submit Event</Link>
            {currentUser?.is_admin && (
              <Link to="/admin" className="nav-link">Admin</Link>
            )}
          </div>

          <button className="nav-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="submit-shell">
        <div className="submit-card">
          <h2>Submit an Event</h2>
          <p>Logged in as: {currentUser?.username || 'User'}</p>

          {message && <div className="submit-message">{message}</div>}

          {loadingMeta ? (
            <p>Loading form data...</p>
          ) : (
            <form onSubmit={handleSubmit} className="submit-form">
              <input
                className="submit-input"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Event title"
                required
              />

              <textarea
                className="submit-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Event description"
                rows={5}
              />

              <div className="submit-two-col">
                <input
                  className="submit-input"
                  type="datetime-local"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  required
                />
                <input
                  className="submit-input"
                  type="datetime-local"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                />
              </div>

              <div className="submit-two-col">
                <select
                  className="submit-input"
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
                  className="submit-input"
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

              <div className="submit-two-col">
                <select
                  className="submit-input"
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
                  className="submit-input"
                  name="source_url"
                  value={form.source_url}
                  onChange={handleChange}
                  placeholder="Source URL"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Event'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmitEventPage;