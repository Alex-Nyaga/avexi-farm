import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const Auth = () => {
  const { doLogin } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }

    setLoading(true);
    const result = await doLogin(username, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth">
      <div className="auth-wrap">
        <div className="auth-logo">
          <div>
            <div className="auth-name">Avexi</div>
            <div className="auth-sub-name">Farm Management</div>
          </div>
        </div>
        <div className="auth-card">
          <h2>Sign in to continue</h2>
          {error && (
            <div className="auth-err" style={{ display: 'block' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="fg" style={{ marginBottom: '1rem' }}>
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="fg" style={{ marginBottom: '1.25rem' }}>
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '2.8rem', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8ab09a',
                    padding: '4px',
                    lineHeight: '1'
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn-auth"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
          <div className="auth-farm-info">
            <p>Farm Owner: <strong>Avelyne Wambui</strong></p>
            <p>Administrator: <strong>Alex Nyaga</strong></p>
            <p>Location: Nyandarua County, Kenya</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;