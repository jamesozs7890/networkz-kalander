import React from 'react';
import './BrowsePage.css';
import './MainCalendar.js';
import './BrowsePage.js';
import './OrganizationsPage.js';

function VenuesPage({ onLogout, onNavigate }) {
  const venues = [
    {
      id: 1,
      icon: '🏛️',
      title: 'Central Community Center',
      description: 'A versatile venue hosting everything from community meetings to cultural performances. Capacity: 500 people.',
      upcomingEvents: '15 upcoming events'
    },
    {
      id: 2,
      icon: '🎭',
      title: 'Historic Theater District',
      description: 'Home to live performances, concerts, and theatrical productions in a beautifully restored 1920s venue.',
      upcomingEvents: '8 upcoming events'
    },
    {
      id: 3,
      icon: '🌳',
      title: 'Riverside Park',
      description: 'Beautiful outdoor space perfect for festivals, farmers markets, and community gatherings by the water.',
      upcomingEvents: '12 upcoming events'
    },
    {
      id: 4,
      icon: '🏟️',
      title: 'City Stadium',
      description: 'Premier sports venue hosting major athletic events, concerts, and large-scale community gatherings.',
      upcomingEvents: '10 upcoming events'
    },
    {
      id: 5,
      icon: '🎨',
      title: 'Downtown Art Gallery',
      description: 'Contemporary art space featuring rotating exhibitions, artist talks, and creative workshops.',
      upcomingEvents: '6 upcoming events'
    },
    {
      id: 6,
      icon: '🍽️',
      title: 'Convention Center',
      description: 'Modern facility perfect for conferences, trade shows, food festivals, and corporate events.',
      upcomingEvents: '20 upcoming events'
    }
  ];

  return (
    <div className="browse-page">
      {/* Navigation */}
      <nav className="top-nav">
        <div className="nav-content">
          <h1 className="nav-logo">CityEvents</h1>
          <div className="nav-links">
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('calendar'); }}>Calendar</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('browse'); }}>Browse</a>
            <a href="#" className="nav-link active">Venues</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('organizations'); }}>Organizations</a>
          </div>
          <button className="nav-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="browse-content">
        <h2 className="page-title">Popular Venues</h2>
        <div className="events-grid-browse">
          {venues.map(venue => (
            <div key={venue.id} className="event-card-large">
              <div className="event-image-large">
                <span className="event-emoji">{venue.icon}</span>
              </div>
              <div className="event-content-large">
                <div className="event-title-large">{venue.title}</div>
                <div className="event-description-large">{venue.description}</div>
                <div className="event-details-large">
                  <div className="event-tag">{venue.upcomingEvents}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VenuesPage;