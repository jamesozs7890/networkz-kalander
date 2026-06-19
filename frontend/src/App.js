import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SignUp from './SignUp';
import MainCalendar from './MainCalendar';
import BrowsePage from './BrowsePage';
import VenuesPage from './VenuesPage';
import OrganizationsPage from './OrganizationsPage';
import AdminPage from './AdminPage';
import SubmitEventPage from './SubmitEventPage';

const API_BASE = 'http://127.0.0.1:8000';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchMe = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Session expired');
      }

      const data = await res.json();
      setCurrentUser(data);
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const validateLogin = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email or username is required';
    if (!password) errs.password = 'Password is required';
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoggingIn(true);
    setLoginErrors({});

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username_or_email: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      localStorage.setItem('token', data.access_token);
      setIsAuthenticated(true);
      await fetchMe();
    } catch (err) {
      console.error('Login error:', err);
      setLoginErrors({ form: err.message || 'Login failed' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Forgot password is not connected yet.');
    setShowForgotPassword(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setShowForgotPassword(false);
    setShowSignUp(false);
  };

  const handleBackToLogin = () => {
    setShowSignUp(false);
    setShowForgotPassword(false);
  };

  if (showSignUp) {
    return <SignUp onBackToLogin={handleBackToLogin} />;
  }

  if (authLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="App">
        <div className="login-container">
          <div className="login-card">
            <h1 className="app-title">KalenderNetz</h1>

            {!showForgotPassword ? (
              <form onSubmit={handleSubmit} className="login-form">
                {loginErrors.form && (
                  <div className="form-error-banner">{loginErrors.form}</div>
                )}

                <div className="form-group">
                  <label htmlFor="email">Email or Username</label>
                  <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (loginErrors.email) setLoginErrors((p) => ({ ...p, email: '' }));
                    }}
                    placeholder="Enter your email or username"
                    className={loginErrors.email ? 'error' : ''}
                  />
                  {loginErrors.email && <span className="error-text">{loginErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginErrors.password) setLoginErrors((p) => ({ ...p, password: '' }));
                    }}
                    placeholder="Enter your password"
                    className={loginErrors.password ? 'error' : ''}
                  />
                  {loginErrors.password && <span className="error-text">{loginErrors.password}</span>}
                </div>

                <button type="submit" className="login-btn" disabled={isLoggingIn}>
                  {isLoggingIn ? 'Signing In...' : 'Sign In'}
                </button>

                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>

                <div className="signup-section">
                  <p>Don&apos;t have an account?</p>
                  <button
                    type="button"
                    className="signup-btn"
                    onClick={() => setShowSignUp(true)}
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="forgot-password-form">
                <h2>Reset Password</h2>
                <p>Enter your email to receive a password reset link</p>

                <div className="form-group">
                  <label htmlFor="reset-email">Email</label>
                  <input
                    type="email"
                    id="reset-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <button type="submit" className="reset-btn">
                  Send Reset Link
                </button>

                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route
          path="/calendar"
          element={<MainCalendar onLogout={handleLogout} currentUser={currentUser} />}
        />
        <Route
          path="/browse"
          element={<BrowsePage onLogout={handleLogout} currentUser={currentUser} />}
        />
        <Route
          path="/venues"
          element={<VenuesPage onLogout={handleLogout} currentUser={currentUser} />}
        />
        <Route
          path="/organizations"
          element={<OrganizationsPage onLogout={handleLogout} currentUser={currentUser} />}
        />
        <Route
          path="/submit-event"
          element={<SubmitEventPage onLogout={handleLogout} currentUser={currentUser} />}
        />
        <Route
          path="/admin"
          element={
            currentUser?.is_admin ? (
              <AdminPage onLogout={handleLogout} currentUser={currentUser} />
            ) : (
              <Navigate to="/calendar" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;