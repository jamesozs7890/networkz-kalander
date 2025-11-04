import React from 'react';
import './BrowsePage.css';
import './MainCalendar.js';
import './VenuesPage.js';
import './OrganizationsPage.js';

function BrowsePage({ onLogout, onNavigate }) {
  const events = [
    {
      id: 1,
      icon: '🎵',
      title: 'Summer Music Festival 2025',
      description: 'Join us for an unforgettable evening of live music featuring local bands and international artists in the heart of downtown.',
      date: 'Jun 15',
      category: 'Music',
      price: '$25'
    },
    {
      id: 2,
      icon: '🍷',
      title: 'Wine & Dine Experience',
      description: 'A sophisticated evening of wine tasting paired with gourmet cuisine from renowned local chefs.',
      date: 'Jun 18',
      category: 'Food & Drink',
      price: '$75'
    },
    {
      id: 3,
      icon: '🎨',
      title: 'Contemporary Art Exhibition',
      description: 'Explore the latest works from emerging and established contemporary artists in our newest gallery space.',
      date: 'Jun 20',
      category: 'Arts & Culture',
      price: 'Free'
    },
    {
      id: 4,
      icon: '⚽',
      title: 'City Championship Finals',
      description: 'The most anticipated match of the season as local teams compete for the championship title.',
      date: 'Jun 22',
      category: 'Sports',
      price: '$15'
    },
    {
      id: 5,
      icon: '🎭',
      title: 'Theater Night Spectacular',
      description: 'An evening of Broadway-style performances featuring talented local actors and musicians.',
      date: 'Jun 25',
      category: 'Arts & Culture',
      price: '$35'
    },
    {
      id: 6,
      icon: '💼',
      title: 'Business Networking Summit',
      description: 'Connect with entrepreneurs, investors, and business leaders in an evening of networking and innovation.',
      date: 'Jun 28',
      category: 'Business',
      price: '$50'
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
            <a href="#" className="nav-link active">Browse</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('venues'); }}>Venues</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('organizations'); }}>Organizations</a>
          </div>
          <button className="nav-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="browse-content">
        <h2 className="page-title">Browse All Events</h2>
        <div className="events-grid-browse">
          {events.map(event => (
            <div key={event.id} className="event-card-large">
              <div className="event-image-large">
                <span className="event-emoji">{event.icon}</span>
                <div className="event-date-badge">{event.date.split(' ')[0]}<br/>{event.date.split(' ')[1]}</div>
              </div>
              <div className="event-content-large">
                <div className="event-title-large">{event.title}</div>
                <div className="event-description-large">{event.description}</div>
                <div className="event-details-large">
                  <div className="event-tag">{event.category}</div>
                  <div className="event-price">{event.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BrowsePage;