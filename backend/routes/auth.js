const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Route de test pour vérifier que l'authentification fonctionne
router.get('/test', (req, res) => {
  res.json({ message: 'Route d\'authentification fonctionnelle', timestamp: new Date().toISOString() });
});

// Route pour vérifier l'état de la base de données
router.get('/check-db', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({
      hasUsers: userCount > 0,
      message: userCount > 0 
        ? 'Base de données initialisée' 
        : 'Aucun utilisateur trouvé'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de la base de données'
    });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur de connexion' });
  }
});

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Créer le nouvel utilisateur (le mot de passe sera hashé automatiquement par le modèle)
    const user = await User.create({
      email,
      password: password, // Le modèle User s'occupe du hashing
      name: name || email.split('@')[0], // Utiliser le nom fourni ou la partie locale de l'email
      role: role || 'student'
    });
    
    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ message: 'Erreur d\'inscription' });
  }
});

module.exports = router; 