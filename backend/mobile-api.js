const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Cours = require('./models/Cours');
const Enseignant = require('./models/Enseignant');
const Surveillance = require('./models/Surveillance');
const { defaultUsers } = require('./config/users');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Configuration
const PORT = process.env.MOBILE_PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;
const MAX_LOGIN_ATTEMPTS = 3;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes

// Stockage des tentatives de connexion
const loginAttempts = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connecté à MongoDB pour l\'API mobile');
  })
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Middleware de vérification des tentatives de connexion
const checkLoginAttempts = (req, res, next) => {
  const ip = req.ip;
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    if (timeSinceLastAttempt < BLOCK_DURATION) {
      const remainingTime = Math.ceil((BLOCK_DURATION - timeSinceLastAttempt) / 1000 / 60);
      return res.status(429).json({
        message: `Trop de tentatives de connexion. Veuillez réessayer dans ${remainingTime} minutes.`
      });
    } else {
      loginAttempts.delete(ip);
    }
  }
  next();
};

// Middleware d'authentification
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Middleware de vérification des rôles
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    next();
  };
};

// Route de connexion
app.post('/api/mobile/login', checkLoginAttempts, (req, res) => {
  const { username, password } = req.body;
  
  // Vérifier les identifiants avec les utilisateurs par défaut
  const user = defaultUsers.find(u => u.username === username && u.password === password);
  
  if (!user) {
    // Incrémenter le compteur de tentatives
    const ip = req.ip;
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(ip, attempts);
    
    return res.status(401).json({ message: 'Identifiants invalides' });
  }
  
  // Réinitialiser les tentatives de connexion
  loginAttempts.delete(req.ip);
  
  // Générer le token JWT
  const token = jwt.sign(
    { username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({ token, user: { username: user.username, role: user.role } });
});

// Routes protégées
app.get('/api/mobile/cours', auth, checkRole(['enseignant', 'eleve']), async (req, res) => {
  try {
    const cours = await Cours.find().populate('enseignant');
    res.json(cours);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour consulter la collection "enseignants" (accessible uniquement aux enseignants)
app.get('/api/mobile/enseignants', auth, checkRole(['enseignant']), async (req, res) => {
  try {
    const enseignants = await Enseignant.find();
    res.json(enseignants);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour consulter la collection "surveillances" (accessible uniquement aux enseignants)
app.get('/api/mobile/surveillances', auth, checkRole(['enseignant']), async (req, res) => {
  try {
    const surveillances = await Surveillance.find();
    res.json(surveillances);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour vérifier l'état du serveur
app.get('/api/mobile/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`API mobile démarrée sur le port ${PORT}`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('Arrêt de l\'API mobile...');
  server.close(() => {
    console.log('API mobile arrêtée');
    process.exit(0);
  });
});

module.exports = server; 