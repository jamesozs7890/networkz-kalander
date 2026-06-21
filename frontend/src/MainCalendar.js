import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './MainCalendar.css';

function MainCalendar({ onLogout, currentUser }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = 'http://127.0.0.1:8000';

  const toLocalDateKey = (dateValue) => {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  function normalizeCategory(name) {
    const value = String(name || '').toLowerCase();

    if (value.includes('music')) return 'music';
    if (value.includes('art') || value.includes('culture') || value.includes('vernissage')) {
      return 'arts';
    }
    if (value.includes('food') || value.includes('drink')) return 'food';
    if (value.includes('sport')) return 'sports';
    if (value.includes('business')) return 'business';
    return 'community';
  }

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
            title: event.title || 'Untitled Event',
            organization:
              typeof event.organization === 'string'
                ? event.organization
                : event.organization?.name || '',
            date: start ? toLocalDateKey(start) : '',
            time: start
              ? start.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })
              : '',
            location:
              typeof event.venue === 'string'
                ? event.venue
                : event.venue?.name || '',
            categoryRaw:
              typeof event.category === 'string'
                ? event.category
                : event.category?.name || 'Community',
            category:
              typeof event.category === 'string'
                ? normalizeCategory(event.category)
                : normalizeCategory(event.category?.name || 'Community'),
            description: event.description || '',
            image: '📅'
          };
        });

        setEvents(mappedEvents);

        if (mappedEvents.length > 0 && mappedEvents[0].date) {
          const firstEventDate = new Date(mappedEvents[0].date);
          setSelectedDate(firstEventDate);
          setCurrentMonth(new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1));
        }
      } catch (err) {
        console.error('Error loading public events:', err);
        setError('Could not load events from the backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicEvents();
  }, []);

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'music', name: 'Music' },
    { id: 'arts', name: 'Arts & Culture' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'sports', name: 'Sports' },
    { id: 'community', name: 'Community' },
    { id: 'business', name: 'Business' }
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;

      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search) ||
        event.organization.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.categoryRaw.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchTerm]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = toLocalDateKey(date);
    return filteredEvents.filter((event) => event.date === dateStr);
  };

  const getSelectedDateEvents = () => {
    const dateStr = toLocalDateKey(selectedDate);
    return filteredEvents.filter((event) => event.date === dateStr);
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateHeader = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const days = getDaysInMonth(currentMonth);
  const selectedDateEvents = getSelectedDateEvents();

  return (
    <div className="calendar-page-new">
      <nav className="top-nav">
        <div className="nav-content">
          <h1 className="nav-logo">KalenderNetz</h1>

          <div className="nav-links">
            <Link to="/calendar" className="nav-link active">Calendar</Link>
            <Link to="/browse" className="nav-link">Browse</Link>
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

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Your City</h1>
          <p className="hero-subtitle">
            All local events in one place - never miss what matters to you
          </p>

          <div className="hero-search">
            <input
              type="text"
              className="hero-search-input"
              placeholder="Search events, venues, or organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="hero-search-btn">Search</button>
          </div>
        </div>
      </section>

      <section className="category-pills-section">
        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <div className="main-content">
        <div className="calendar-section">
          <div className="calendar-header">
            <h2 className="month-title">{monthYear}</h2>

            <div className="calendar-nav-btns">
              <button
                className="calendar-nav-btn"
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                }
              >
                ←
              </button>

              <button
                className="today-btn"
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today);
                  setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                }}
              >
                Today
              </button>

              <button
                className="calendar-nav-btn"
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                }
              >
                →
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              <div className="weekday">Sun</div>
              <div className="weekday">Mon</div>
              <div className="weekday">Tue</div>
              <div className="weekday">Wed</div>
              <div className="weekday">Thu</div>
              <div className="weekday">Fri</div>
              <div className="weekday">Sat</div>
            </div>

            <div className="calendar-days">
              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                const isSelected = day && day.toDateString() === selectedDate.toDateString();
                const isToday = day && day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`calendar-day ${!day ? 'empty' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day && (
                      <>
                        <span className="day-number">{day.getDate()}</span>
                        {dayEvents.length > 0 && (
                          <div className="event-dots">
                            {dayEvents.slice(0, 3).map((event, i) => (
                              <span key={i} className={`event-dot ${event.category}`}></span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="events-sidebar">
          <h3 className="sidebar-title">Selected Day Events</h3>
          <p className="sidebar-date">{formatDateHeader(selectedDate)}</p>

          {loading && (
            <div className="no-events-message">
              <p>Loading events...</p>
            </div>
          )}

          {error && !loading && (
            <div className="no-events-message">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="events-list">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div key={event.id} className="event-card-mini">
                    <div className="event-card-header">
                      <h4 className="event-card-title">{event.title}</h4>
                      <span className={`event-category-badge ${event.category}`}>
                        {categories.find((c) => c.id === event.category)?.name || event.categoryRaw}
                      </span>
                    </div>

                    <div className="event-card-info">
                      <div className="event-info-item">
                        <span className="info-icon">📍</span>
                        <span>{formatTime(event.time)}</span>
                        <span>•</span>
                        <span>{event.location || 'No location'}</span>
                      </div>

                      {event.organization && (
                        <div className="event-info-item">
                          <span className="info-icon">🏢</span>
                          <span>{event.organization}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-events-message">
                  <p>No events scheduled for this day</p>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default MainCalendar;