import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SignUp from './SignUp';
import MainCalendar from './MainCalendar';
import BrowsePage from './BrowsePage';
import VenuesPage from './VenuesPage';
import OrganizationsPage from './OrganizationsPage';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    setIsAuthenticated(true);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    console.log('Forgot password for:', email);
    alert('Password reset link sent to your email!');
    setShowForgotPassword(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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

  if (!isAuthenticated) {
    return (
      <div className="App">
        <div className="login-container">
          <div className="login-card">
            <h1 className="app-title">Networkz Kalander</h1>
            
            {!showForgotPassword ? (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                
                <button type="submit" className="login-btn">
                  Sign In
                </button>
                
                <button 
                  type="button" 
                  className="forgot-password-btn"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
                
                <div className="signup-section">
                  <p>Don't have an account?</p>
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
        <Route path="/calendar" element={<MainCalendar onLogout={handleLogout} />} />
        <Route path="/browse" element={<BrowsePage onLogout={handleLogout} />} />
        <Route path="/venues" element={<VenuesPage onLogout={handleLogout} />} />
        <Route path="/organizations" element={<OrganizationsPage onLogout={handleLogout} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;