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

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // La réponse contient directement le token
      if (data.token) {
        // Stocker le token dans le localStorage
        localStorage.setItem('token', data.token);
        
        // Rediriger vers le planning
        navigate('/planning');
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1976d2',
        margin: 0,
        padding: 0,
        zIndex: 1000,
        overflow: 'hidden'
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
        <h2>{t('auth.login', 'Connexion')}</h2>
        
        {needsSetup && (
          <div className="setup-message">
            <p>{t('auth.noUsers', 'Aucun utilisateur trouvé dans la base de données. Veuillez créer un compte administrateur.')}</p>
            <Link to="/initial-setup" className="setup-link">{t('auth.setupApp', 'Configurer l\'application')}</Link>
          </div>
        )}
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('auth.email', 'Email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.yourEmail', 'Votre email')}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('auth.password', 'Mot de passe')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth.yourPassword', 'Votre mot de passe')}
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? t('auth.loggingIn', 'Connexion...') : t('auth.login', 'Se connecter')}
          </button>
        </form>
        <div className="login-footer">
          <a href="#" className="forgot-password">{t('auth.forgotPassword', 'Mot de passe oublié ?')}</a>
        </div>
      </div>
    </Box>
  );
}

export default Login; 