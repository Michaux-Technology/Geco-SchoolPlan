import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { Box } from '@mui/material';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

function InitialSetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'admin'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation des champs
    if (!formData.name.trim()) {
      setError(t('setup.nameRequired', 'Le nom est requis'));
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('setup.passwordsDontMatch', 'Les mots de passe ne correspondent pas'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('setup.passwordTooShort', 'Le mot de passe doit contenir au moins 6 caractères'));
      setLoading(false);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('setup.registrationError', 'Erreur lors de l\'inscription'));
      }

      // Redirection vers la page de connexion avec un message de succès
      navigate('/login', { state: { message: t('setup.accountCreatedSuccess', 'Compte créé avec succès. Vous pouvez maintenant vous connecter.') } });
    } catch (err) {
      setError(err.message || t('setup.registrationError', 'Erreur lors de l\'inscription'));
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
          top: { xs: 8, sm: 16 }, 
          right: { xs: 8, sm: 16 }, 
          zIndex: 1050
        }}
      >
        <LanguageSwitcher />
      </Box>
      
      <Box 
        className="login-box"
        sx={{ 
          marginTop: { xs: '60px', sm: '0px' }
        }}
      >
        <h2>{t('setup.initialSetup', 'Configuration initiale')}</h2>
        <div className="setup-message">
          <p>{t('setup.createAdminAccount', 'Créez un compte administrateur pour commencer à utiliser l\'application.')}</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('setup.name', 'Nom')}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('setup.yourName', 'Votre nom')}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('setup.email', 'Email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('setup.yourEmail', 'Votre email')}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('setup.password', 'Mot de passe')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('setup.yourPassword', 'Votre mot de passe')}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">{t('setup.confirmPassword', 'Confirmer le mot de passe')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t('setup.confirmYourPassword', 'Confirmez votre mot de passe')}
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? t('setup.creating', 'Création en cours...') : t('setup.createAccount', 'Créer le compte')}
          </button>
        </form>
      </Box>
    </Box>
  );
}

export default InitialSetup; 