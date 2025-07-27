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
  const [databaseStatus, setDatabaseStatus] = useState('checking');
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Vérifier si la base de données est vide (aucun utilisateur)
    const checkDatabase = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/check-database`);
        const data = await response.json();
        setDatabaseStatus(data.status);
        setNeedsSetup(!data.hasUsers);
        // Si aucun utilisateur n'existe, rediriger automatiquement vers InitialSetup
        if (!data.hasUsers) {
          navigate('/initial-setup');
        }
      } catch (err) {
        setDatabaseStatus('error');
      }
    };
    checkDatabase();
    // Afficher le message de succès s'il est passé dans l'état de la location
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location.state, navigate]);

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
      console.log('Tentative de connexion avec:', { email: formData.email, password: '***' });
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.30:5000';
      console.log('URL de l\'API:', API_URL);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Statut de la réponse:', response.status);
      console.log('Headers de la réponse:', Object.fromEntries(response.headers.entries()));

      let data;
      try {
        const responseText = await response.text();
        console.log('Réponse brute du serveur:', responseText);
        
        if (responseText.trim()) {
          data = JSON.parse(responseText);
        } else {
          data = { message: 'Réponse vide du serveur' };
        }
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        data = { message: 'Réponse invalide du serveur' };
      }

      console.log('Données parsées:', data);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setSuccess(t('auth.loginSuccess'));
        navigate('/planning');
      } else {
        // Afficher le message d'erreur spécifique du serveur
        setError(data.message || t('auth.loginError'));
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      
      // Diagnostic détaillé de l'erreur
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Erreur de connexion au serveur. Vérifiez que le serveur est démarré.');
      } else if (err.name === 'SyntaxError') {
        setError('Réponse invalide du serveur. Vérifiez la configuration.');
      } else {
        setError(t('auth.loginError'));
      }
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