import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '../styles/Login.css';
import { Box } from '@mui/material';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState('loading');

  useEffect(() => {
    // Vérifier si la base de données est vide (aucun utilisateur)
    const checkDatabase = async () => {
      try {
        const response = await fetch('/api/check-database');
        const data = await response.json();
        setDatabaseStatus(data.status);
        setNeedsSetup(!data.hasUsers);
      } catch (err) {
        setDatabaseStatus('error');
      }
    };

    checkDatabase();
    
    // Afficher le message de succès s'il est passé dans l'état de la location
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setSuccess(t('auth.loginSuccess'));
        navigate('/planning');
      } else {
        setError(t('auth.loginError'));
      }
    } catch (err) {
      setError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      className="login-container"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative'
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          zIndex: 1050
        }}
      >
        <LanguageSwitcher />
      </Box>
      
      <div className="login-box">
        <h2>{t('auth.login')}</h2>
        
        {needsSetup && (
          <div className="setup-message">
            <p>{t('auth.noUsers')}</p>
            <Link to="/initial-setup" className="setup-link">{t('auth.setupApp')}</Link>
          </div>
        )}
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.yourEmail')}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth.yourPassword')}
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>
        <div className="login-footer">
          <a href="#" className="forgot-password">{t('auth.forgotPassword')}</a>
        </div>
      </div>
    </Box>
  );
}

export default Login; 