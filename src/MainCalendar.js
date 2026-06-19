import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './MainCalendar.css';

function MainCalendar({ onLogout }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadedCsvFiles, setLoadedCsvFiles] = useState([]);
  const [importedEventCount, setImportedEventCount] = useState(0);

  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Summer Jazz Festival',
      organization: 'City Arts Council',
      date: '2025-06-03',
      time: '18:00',
      location: 'Central Park',
      category: 'music',
      description: 'Evening of smooth jazz under the stars',
      image: '🎵'
    },
    {
      id: 2,
      title: 'Tech Startup Mixer',
      organization: 'Tech Hub Network',
      date: '2025-06-03',
      time: '19:00',
      location: 'Innovation Center',
      category: 'business',
      description: 'Network with local entrepreneurs',
      image: '💼'
    },
    {
      id: 3,
      title: 'Art Gallery Opening',
      organization: 'Modern Art Museum',
      date: '2025-06-05',
      time: '18:30',
      location: 'Downtown Gallery',
      category: 'arts',
      description: 'Contemporary art exhibition',
      image: '🎨'
    },
    {
      id: 4,
      title: 'Food Truck Festival',
      organization: 'Local Food Network',
      date: '2025-06-06',
      time: '11:00',
      location: 'City Square',
      category: 'food',
      description: 'Taste cuisine from 20+ food trucks',
      image: '🍔'
    },
    {
      id: 5,
      title: 'Community Yoga',
      organization: 'Wellness Center',
      date: '2025-06-10',
      time: '08:00',
      location: 'Riverside Park',
      category: 'community',
      description: 'Free outdoor yoga for all levels',
      image: '🧘'
    },
    {
      id: 6,
      title: 'City Marathon',
      organization: 'Sports Association',
      date: '2025-06-14',
      time: '07:00',
      location: 'City Stadium',
      category: 'sports',
      description: '5K, 10K, and half marathon',
      image: '🏃'
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'imported', name: 'Imported' },
    { id: 'music', name: 'Music' },
    { id: 'arts', name: 'Arts & Culture' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'sports', name: 'Sports' },
    { id: 'community', name: 'Community' },
    { id: 'business', name: 'Business' }
  ];

  const normalizeCsvDate = (csvDate) => {
    const value = String(csvDate).replace(/\u200b/g, '').replace(/\uFEFF/g, '').trim();
    if (!value) return '';

    const germanMonths = {
      januar: 'January', jan: 'January', februar: 'February', feb: 'February',
      märz: 'March', maerz: 'March', marz: 'March', april: 'April', mai: 'May',
      juni: 'June', juli: 'July', august: 'August', september: 'September',
      okt: 'October', oktober: 'October', november: 'November', dezember: 'December'
    };

    const replaceGermanMonth = (text) => {
      return text.replace(/\b([A-Za-zÄÖÜäöüß]+)\b/g, (match) => {
        const lower = match.toLowerCase();
        return germanMonths[lower] || match;
      });
    };

    const dateOnlyMatch = value.match(/^(\d{1,2})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{4})/);
    if (dateOnlyMatch) {
      const [, day, month, year] = dateOnlyMatch;
      return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    let cleaned = value.replace(/^[A-Za-zÄÖÜäöüß]+\.?\s*,?\s*/i, '');
    cleaned = cleaned.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    cleaned = replaceGermanMonth(cleaned);

    const parsedDate = new Date(cleaned);
    if (!Number.isNaN(parsedDate.valueOf())) {
      return parsedDate.toISOString().slice(0, 10);
    }

    const isoMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    return '';
  };

  const parseCsvLine = (line) => {
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    cells.push(current);
    return cells;
  };

  const parseCsv = (csvText) => {
    const cleanedText = csvText.replace(/^\uFEFF/, '').trim();
    const lines = cleanedText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const header = parseCsvLine(lines[0]).map((col) => col.trim().toLowerCase());
    const dateIndex = header.findIndex((col) => col.includes('date'));
    const titleIndex = header.findIndex((col) => col.includes('title'));
    const timeIndex = header.findIndex((col) => col.includes('time'));
    const urlIndex = header.findIndex((col) => col.includes('url'));

    return lines.slice(1).map((line, index) => {
      const cells = parseCsvLine(line);
      const rawDate = cells[dateIndex] || '';
      const rawTitle = cells[titleIndex] || '';
      const rawTime = timeIndex >= 0 ? cells[timeIndex] || '' : '';
      const rawUrl = urlIndex >= 0 ? cells[urlIndex] || '' : '';

      return {
        id: Date.now() + index,
        title: rawTitle.trim() || 'Untitled Event',
        organization: 'Imported event',
        date: normalizeCsvDate(rawDate),
        time: rawTime.trim(),
        location: '',
        category: 'imported',
        description: '',
        image: '📌',
        url: rawUrl.trim()
      };
    }).filter((event) => event.date && event.title);
  };

  const readCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const importedEvents = parseCsv(text);
        resolve(importedEvents);
      };
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsText(file, 'UTF-8');
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const importedArrays = await Promise.all(files.map(readCsvFile));
      const importedEvents = importedArrays.flat();
      if (importedEvents.length > 0) {
        setEvents((prevEvents) => [...prevEvents, ...importedEvents]);
        setLoadedCsvFiles(files.map((file) => file.name));
        setImportedEventCount((count) => count + importedEvents.length);

        const firstDate = importedEvents[0].date.split('-');
        if (firstDate.length === 3) {
          setCurrentMonth(new Date(Number(firstDate[0]), Number(firstDate[1]) - 1, 1));
          setSelectedDate(new Date(Number(firstDate[0]), Number(firstDate[1]) - 1, Number(firstDate[2])));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

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
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getTodaysEvents = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return events.filter(event => {
      const matchesDate = event.date === dateStr;
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesSearch = searchTerm.trim() === '' || event.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesCategory && matchesSearch;
    });
  };

  const formatTime = (time) => {
    if (!time) return 'All day';
    const [hours, minutes] = time.split(':');
    if (!hours || !minutes) return time;
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateHeader = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = getDaysInMonth(currentMonth);
  const todaysEvents = getTodaysEvents();

  return (
    <div className="calendar-page-new">
      {/* Navigation */}
      <nav className="top-nav">
        <div className="nav-content">
          <h1 className="nav-logo">CityEvents</h1>
          <div className="nav-links">
            <Link to="/calendar" className="nav-link active">Calendar</Link>
            <Link to="/browse" className="nav-link">Browse</Link>
            <Link to="/venues" className="nav-link">Venues</Link>
            <Link to="/organizations" className="nav-link">Organizations</Link>
          </div>
          <button className="nav-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Your City</h1>
          <p className="hero-subtitle">All local events in one place - never miss what matters to you</p>
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

      <section className="csv-upload-section">
        <div className="upload-card">
          <div>
            <h3>Load events from CSV</h3>
            <p>Choose a CSV file with Date, Title, Time, and URL columns to show events on the calendar.</p>
          </div>
          <label className="csv-upload-label">
            Select CSV files
            <input
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileUpload}
              className="csv-upload-input"
            />
          </label>
          {loadedCsvFiles.length > 0 && (
            <div className="csv-upload-info">
              <p className="csv-upload-text">Loaded files: {loadedCsvFiles.join(', ')}</p>
              <p className="csv-upload-text">Imported events: {importedEventCount}</p>
            </div>
          )}
        </div>
      </section>

      {/* Category Pills */}
      <section className="category-pills-section">
        <div className="category-pills">
          {categories.map(cat => (
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

      {/* Main Content: Calendar + Sidebar */}
      <div className="main-content">
        <div className="calendar-section">
          <div className="calendar-header">
            <h2 className="month-title">{monthYear}</h2>
            <div className="calendar-nav-btns">
              <button 
                className="calendar-nav-btn"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              >
                ←
              </button>
              <button className="today-btn" onClick={() => setCurrentMonth(new Date(2025, 5, 1))}>
                Today
              </button>
              <button 
                className="calendar-nav-btn"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
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
                const events = day ? getEventsForDate(day) : [];
                const isSelected = day && day.toDateString() === selectedDate.toDateString();
                const isToday = day && day.toDateString() === new Date(2025, 5, 3).toDateString();

                return (
                  <div
                    key={index}
                    className={`calendar-day ${!day ? 'empty' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day && (
                      <>
                        <span className="day-number">{day.getDate()}</span>
                        {events.length > 0 && (
                          <div className="event-dots">
                            {events.slice(0, 3).map((event, i) => (
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

        {/* Today's Events Sidebar */}
        <aside className="events-sidebar">
          <h3 className="sidebar-title">Today's Events</h3>
          <p className="sidebar-date">{formatDateHeader(selectedDate)}</p>

          <div className="events-list">
            {todaysEvents.length > 0 ? (
              todaysEvents.map(event => (
                <div key={event.id} className="event-card-mini">
                  <div className="event-card-header">
                    <h4 className="event-card-title">{event.title}</h4>
                    <span className={`event-category-badge ${event.category}`}>
                      {categories.find(c => c.id === event.category)?.name || event.category}
                    </span>
                  </div>
                  <div className="event-card-info">
                    <div className="event-info-item">
                      <span className="info-icon">🎵</span>
                      <span>{formatTime(event.time)}</span>
                      <span>•</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events-message">
                <p>No events scheduled for this day</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MainCalendar;