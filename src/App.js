import React, { useState } from 'react';
import './App.css';
import SignUp from './SignUp';
import MainCalendar from './MainCalendar';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  console.log('Current page state is:', currentPage);

  const handleSubmit = (e) => {
  e.preventDefault();
  console.log('Login attempt:', { email, password });
  console.log('BEFORE setCurrentPage, currentPage is:', currentPage);
  setCurrentPage('calendar');
  console.log('AFTER setCurrentPage, trying to set to: calendar');
};

  const handleForgotPassword = (e) => {
    e.preventDefault();
    console.log('Forgot password for:', email);
    alert('Password reset link sent to your email!');
    setShowForgotPassword(false);
  };

  const handleSignUpClick = () => {
    setCurrentPage('signup');
  };

  const handleBackToLogin = () => {
    setCurrentPage('login');
    setShowForgotPassword(false);
  };

  const handleLogout = () => {
    setCurrentPage('login');
    setEmail('');
    setPassword('');
    setShowForgotPassword(false);
  };

  if (currentPage === 'signup') {
    return <SignUp onBackToLogin={handleBackToLogin} />;
  }

  if (currentPage === 'calendar') {
    return <MainCalendar onLogout={handleLogout} />;
  }

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
                  onClick={handleSignUpClick}
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

export default App;