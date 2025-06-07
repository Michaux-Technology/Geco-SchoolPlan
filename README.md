# Geco-SchoolPlan

Application de gestion d'emploi du temps scolaire avec une API mobile.

Cette application a un frontend web qui permet la gestion de planning (modification, affectation, visualisation...)
et une application mobile pour les enseignants et eleves qui peuvent se connecter au serveur avec leur Smartphone en visualisation uniquement :

https://github.com/Michaux-Technology/Geco-SchoolPlan-App


Attention, ce programme est encore en cours de developpement.

## Fonctionnalités

- Authentification des utilisateurs (enseignants et élèves)
- Gestion des cours
- Gestion des surveillances
- API mobile sécurisée

## Prérequis

- Node.js
- MongoDB
- npm ou yarn

## Installation

1. Clonez le repository :
```bash
git clone [URL_DU_REPO]
cd Geco-SchoolPlan
```

2. Installez les dépendances backend :
```bash
cd backend
npm install
```

3. Installez les dépendances frontend :
```bash
cd frontend
npm install
```

4. Créez un fichier `.env` à la racine du dossier backend avec les variables suivantes :
```
MONGODB_URI=votre_uri_mongodb
// Exemple : MONGODB_URI=mongodb://192.168.1.104:27017/Geco-SchoolPlan
JWT_SECRET=votre_secret_jwt
PORT=5001
```

## Démarrage

Pour lancer le backend :
```bash
cd backend
npm start
```

Pour lancer le frontend :
```bash
cd frontend
npm run dev
```

## API Endpoints

- POST `/api/mobile/login` - Connexion utilisateur
- GET `/api/mobile/cours` - Liste des cours
- GET `/api/mobile/enseignants` - Liste des enseignants
- GET `/api/mobile/surveillances` - Liste des surveillances
- GET `/api/mobile/status` - État du serveur

## Sécurité

- Limitation des tentatives de connexion
- Authentification par JWT
- Contrôle d'accès basé sur les rôles

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request. 
