import React from 'react';
import './BrowsePage.css';
import './MainCalendar.js';
import './BrowsePage.js';
import './VenuesPage.js';


function OrganizationsPage({ onLogout, onNavigate }) {
  const organizations = [
    {
      id: 1,
      icon: '🎪',
      title: 'City Arts Council',
      description: 'Promoting local artists and cultural events throughout the community with monthly exhibitions and performances.',
      type: 'Non-Profit'
    },
    {
      id: 2,
      icon: '🏃',
      title: 'Metro Sports League',
      description: 'Organizing competitive sports events, tournaments, and recreational activities for all ages and skill levels.',
      type: 'Sports Organization'
    },
    {
      id: 3,
      icon: '🍽️',
      title: 'Foodie Collective',
      description: 'Bringing together food enthusiasts through tastings, cooking classes, and restaurant collaborations.',
      type: 'Community Group'
    },
    {
      id: 4,
      icon: '💼',
      title: 'Business Network Hub',
      description: 'Connecting entrepreneurs and professionals through networking events, workshops, and mentorship programs.',
      type: 'Professional Organization'
    },
    {
      id: 5,
      icon: '🎵',
      title: 'Music Alliance',
      description: 'Supporting local musicians and music venues with concerts, open mic nights, and music education programs.',
      type: 'Arts Organization'
    },
    {
      id: 6,
      icon: '🌱',
      title: 'Green Community Initiative',
      description: 'Organizing environmental awareness events, clean-up drives, and sustainability workshops for the community.',
      type: 'Environmental Group'
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
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('venues'); }}>Venues</a>
            <a href="#" className="nav-link active">Organizations</a>
          </div>
          <button className="nav-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="browse-content">
        <h2 className="page-title">Event Organizations</h2>
        <div className="events-grid-browse">
          {organizations.map(org => (
            <div key={org.id} className="event-card-large">
              <div className="event-image-large">
                <span className="event-emoji">{org.icon}</span>
              </div>
              <div className="event-content-large">
                <div className="event-title-large">{org.title}</div>
                <div className="event-description-large">{org.description}</div>
                <div className="event-details-large">
                  <div className="event-tag">{org.type}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrganizationsPage;