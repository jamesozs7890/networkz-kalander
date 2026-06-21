import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './BrowsePage.css';

function BrowsePage({ onLogout, currentUser }) {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchPublicEvents = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`${API_BASE}/events/public?limit=1000&upcoming_only=false`);

        if (!res.ok) {
          throw new Error('Failed to fetch public events');
        }

        const data = await res.json();

        const mappedEvents = (Array.isArray(data) ? data : []).map((event) => {
          const start = event.start_time ? new Date(event.start_time) : null;

          return {
            id: event.id,
            icon: '📅',
            title: event.title || 'Untitled Event',
            description: event.description || 'No description available.',
            dateObj: start,
            dateText: start
              ? start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'TBD',
            category:
              typeof event.category === 'string'
                ? event.category
                : event.category?.name || 'Community',
            price: 'Free',
            venue:
              typeof event.venue === 'string'
                ? event.venue
                : event.venue?.name || '',
            organization:
              typeof event.organization === 'string'
                ? event.organization
                : event.organization?.name || ''
          };
        });

        setEvents(mappedEvents);
      } catch (err) {
        console.error('Error loading public events:', err);
        setError('Could not load events from the backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicEvents();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        events
          .map((event) => event.category)
          .filter(Boolean)
      )
    ).sort();

    return ['all', ...unique];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        event.category.toLowerCase() === selectedCategory.toLowerCase();

      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.category.toLowerCase().includes(search) ||
        event.venue.toLowerCase().includes(search) ||
        event.organization.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchTerm]);

  return (
    <div className="browse-page">
      <nav className="top-nav">
        <div className="nav-content">
          <h1 className="nav-logo">KalenderNetz</h1>

          <div className="nav-links">
            <Link to="/calendar" className="nav-link">Calendar</Link>
            <Link to="/browse" className="nav-link active">Browse</Link>
            <Link to="/venues" className="nav-link">Venues</Link>
            <Link to="/organizations" className="nav-link">Organizations</Link>
            <Link to="/submit-event" className="nav-link">Submit Event</Link>
            {currentUser?.is_admin && (
              <Link to="/admin" className="nav-link">Admin</Link>
            )}
          </div>

          <button className="nav-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="browse-content">
        <h2 className="page-title">Browse All Events</h2>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px', minWidth: '260px' }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '10px' }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        {loading && <p>Loading events...</p>}
        {error && !loading && <p>{error}</p>}

        {!loading && !error && (
          <div className="events-grid-browse">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div key={event.id} className="event-card-large">
                  <div className="event-image-large">
                    <span className="event-emoji">{event.icon}</span>
                    <div className="event-date-badge">
                      {event.dateText.split(' ')[0]}
                      <br />
                      {event.dateText.split(' ')[1] || ''}
                    </div>
                  </div>

                  <div className="event-content-large">
                    <div className="event-title-large">{event.title}</div>
                    <div className="event-description-large">{event.description}</div>

                    <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                      {event.organization && (
                        <div><strong>Organization:</strong> {event.organization}</div>
                      )}
                      {event.venue && (
                        <div><strong>Venue:</strong> {event.venue}</div>
                      )}
                    </div>

                    <div className="event-details-large">
                      <div className="event-tag">{event.category}</div>
                      <div className="event-price">{event.price}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No matching events found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowsePage;