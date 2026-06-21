import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './BrowsePage.css';

function VenuesPage({ onLogout }) {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchPublicEvents = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`${API_BASE}/events/public?limit=1000`);

        if (!res.ok) {
          throw new Error('Failed to fetch public events');
        }

        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading public events:', err);
        setError('Could not load venues from the backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicEvents();
  }, []);

  const venues = useMemo(() => {
    const venueMap = new Map();

    events.forEach((event) => {
      const rawVenue = event.venue;
      const venueName =
        typeof rawVenue === 'string'
          ? rawVenue
          : rawVenue?.name || 'Unknown Venue';

      const venueId =
        typeof rawVenue === 'object' && rawVenue?.id
          ? rawVenue.id
          : venueName;

      const description =
        typeof rawVenue === 'object' && rawVenue?.description
          ? rawVenue.description
          : 'Venue hosting community events and public activities.';

      if (!venueMap.has(venueId)) {
        venueMap.set(venueId, {
          id: venueId,
          icon: '📍',
          title: venueName,
          description,
          eventCount: 0
        });
      }

      venueMap.get(venueId).eventCount += 1;
    });

    return Array.from(venueMap.values()).sort((a, b) => b.eventCount - a.eventCount);
  }, [events]);

  const filteredVenues = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return venues.filter((venue) => {
      return (
        !search ||
        venue.title.toLowerCase().includes(search) ||
        venue.description.toLowerCase().includes(search)
      );
    });
  }, [venues, searchTerm]);

  return (
    <div className="browse-page">
      <nav className="top-nav">
        <div className="nav-content">
          <h1 className="nav-logo">CityEvents</h1>
          <div className="nav-links">
            <Link to="/calendar" className="nav-link">Calendar</Link>
            <Link to="/browse" className="nav-link">Browse</Link>
            <Link to="/venues" className="nav-link active">Venues</Link>
            <Link to="/organizations" className="nav-link">Organizations</Link>
            <Link to="/admin" className="nav-link">Admin</Link>
          </div>
          <button className="nav-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="browse-content">
        <h2 className="page-title">Popular Venues</h2>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px', minWidth: '260px' }}
          />
        </div>

        {loading && <p>Loading venues...</p>}
        {error && !loading && <p>{error}</p>}

        {!loading && !error && (
          <div className="events-grid-browse">
            {filteredVenues.length > 0 ? (
              filteredVenues.map((venue) => (
                <div key={venue.id} className="event-card-large">
                  <div className="event-image-large">
                    <span className="event-emoji">{venue.icon}</span>
                  </div>
                  <div className="event-content-large">
                    <div className="event-title-large">{venue.title}</div>
                    <div className="event-description-large">{venue.description}</div>
                    <div className="event-details-large">
                      <div className="event-tag">
                        {venue.eventCount} upcoming event{venue.eventCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No venues found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VenuesPage;