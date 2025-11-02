import React, { useState } from 'react';
import './MainCalendar.css';

function MainCalendar({ onLogout }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const sampleEvents = [
    {
      id: 1,
      title: 'Summer Music Festival',
      organization: 'City Arts Council',
      date: '2025-11-15',
      time: '18:00',
      location: 'Central Park',
      category: 'music',
      description: 'Annual summer music festival featuring local bands and artists.',
      image: '🎵'
    },
    {
      id: 2,
      title: 'Tech Innovation Summit',
      organization: 'Tech Hub Network',
      date: '2025-11-10',
      time: '09:00',
      location: 'Convention Center',
      category: 'business',
      description: 'Bringing together innovators and entrepreneurs from across the region.',
      image: '💻'
    },
    {
      id: 3,
      title: 'Community Food Fair',
      organization: 'Local Food Bank',
      date: '2025-11-12',
      time: '11:00',
      location: 'Community Center',
      category: 'community',
      description: 'Free food tasting and donations welcome.',
      image: '🍽️'
    },
    {
      id: 4,
      title: 'Marathon 2025',
      organization: 'City Sports Association',
      date: '2025-11-20',
      time: '07:00',
      location: 'City Stadium',
      category: 'sports',
      description: 'Annual city marathon with 5K, 10K, and full marathon options.',
      image: '🏃'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Events', icon: '📅' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'arts', name: 'Arts', icon: '🎨' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'community', name: 'Community', icon: '👥' }
  ];

  const filteredEvents = sampleEvents.filter(event => {
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🗓️ Networkz Kalander</h1>
            <p>Your City's Central Event Hub</p>
          </div>
          <div className="header-right">
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search events or organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </section>

      <section className="category-section">
        <div className="category-container">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="events-section">
        <div className="events-header">
          <h2>Upcoming Events</h2>
          <p className="events-count">{filteredEvents.length} events found</p>
        </div>
        
        <div className="events-grid">
          {filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-icon">{event.image}</div>
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-organization">{event.organization}</p>
                <p className="event-description">{event.description}</p>
                <div className="event-details">
                  <div className="event-detail">
                    <span className="detail-icon">📅</span>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="event-detail">
                    <span className="detail-icon">🕐</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="event-detail">
                    <span className="detail-icon">📍</span>
                    <span>{event.location}</span>
                  </div>
                </div>
                <button className="event-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="calendar-footer">
        <p>© 2025 Networkz Kalander - Connecting Communities Through Events</p>
      </footer>
    </div>
  );
}

export default MainCalendar;