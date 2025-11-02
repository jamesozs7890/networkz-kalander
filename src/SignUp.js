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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Business email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.businessNumber.trim()) {
      newErrors.businessNumber = 'Business number is required';
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = 'Business address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Sign up data:', formData);
      alert('Account created successfully!');
      onBackToLogin();
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="app-title">Networkz Kalander</h1>
        <h2 className="signup-title">Create Business Account</h2>
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter your business name"
                className={errors.businessName ? 'error' : ''}
              />
              {errors.businessName && <span className="error-text">{errors.businessName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="businessEmail">Business Email *</label>
              <input
                type="email"
                id="businessEmail"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleInputChange}
                placeholder="business@company.com"
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
                placeholder="VAT123456789"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="businessNumber">Business Registration Number *</label>
              <input
                type="text"
                id="businessNumber"
                name="businessNumber"
                value={formData.businessNumber}
                onChange={handleInputChange}
                placeholder="Business registration number"
                className={errors.businessNumber ? 'error' : ''}
              />
              {errors.businessNumber && <span className="error-text">{errors.businessNumber}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="businessAddress">Business Address *</label>
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
            <button type="submit" className="signup-submit-btn">
              Create Account
            </button>
            
            <button 
              type="button" 
              className="back-to-login-btn"
              onClick={onBackToLogin}
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