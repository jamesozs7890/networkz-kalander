import React, { useState } from 'react';
import './SignUp.css';

function SignUp({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    password: '',
    confirmPassword: '',
    vatNumber: '',
    businessNumber: '',
    businessAddress: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = 'http://127.0.0.1:8000';

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Username or business name is required';
    } else if (formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Must be at least 2 characters';
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.vatNumber.trim() && !/^[A-Z]{2}[0-9A-Z]{2,12}$/.test(formData.vatNumber.trim())) {
      newErrors.vatNumber = 'Invalid VAT number format (e.g. DE123456789)';
    }

    if (!formData.businessNumber.trim()) {
      newErrors.businessNumber = 'Business registration number is required';
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{4,5}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Postal code must be 4–5 digits';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.businessEmail.trim(),
          username: formData.businessName.trim(),
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      onBackToLogin();
    } catch (err) {
      console.error('Registration error:', err);
      setFormError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="app-title">KalenderNetz</h1>
        <h2 className="signup-title">Create Account</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          {formError && <div className="form-error-banner">{formError}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="businessName">Username / Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter your username or business name"
                className={errors.businessName ? 'error' : ''}
              />
              {errors.businessName && <span className="error-text">{errors.businessName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="businessEmail">Email *</label>
              <input
                type="email"
                id="businessEmail"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className={errors.businessEmail ? 'error' : ''}
              />
              {errors.businessEmail && <span className="error-text">{errors.businessEmail}</span>}
            </div>
          </div>

          <div className="form-row two-columns">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-row two-columns">
            <div className="form-group">
              <label htmlFor="vatNumber">VAT Number</label>
              <input
                type="text"
                id="vatNumber"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleInputChange}
                placeholder="DE123456789"
                className={errors.vatNumber ? 'error' : ''}
              />
              {errors.vatNumber && <span className="error-text">{errors.vatNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="businessNumber">Business Registration Number *</label>
              <input
                type="text"
                id="businessNumber"
                name="businessNumber"
                value={formData.businessNumber}
                onChange={handleInputChange}
                placeholder="HRB 12345"
                className={errors.businessNumber ? 'error' : ''}
              />
              {errors.businessNumber && <span className="error-text">{errors.businessNumber}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="businessAddress">Address *</label>
              <input
                type="text"
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleInputChange}
                placeholder="Street address"
                className={errors.businessAddress ? 'error' : ''}
              />
              {errors.businessAddress && <span className="error-text">{errors.businessAddress}</span>}
            </div>
          </div>

          <div className="form-row three-columns">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                className={errors.city ? 'error' : ''}
              />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">Postal Code *</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="12345"
                className={errors.postalCode ? 'error' : ''}
              />
              {errors.postalCode && <span className="error-text">{errors.postalCode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Country"
                className={errors.country ? 'error' : ''}
              />
              {errors.country && <span className="error-text">{errors.country}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="signup-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>

            <button
              type="button"
              className="back-to-login-btn"
              onClick={onBackToLogin}
              disabled={isSubmitting}
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;