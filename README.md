# Geco-SchoolPlan

Application de gestion d'emploi du temps scolaire avec une API mobile.

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

2. Installez les dépendances :
```bash
cd backend
npm install
```

3. Créez un fichier `.env` à la racine du dossier backend avec les variables suivantes :
```
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
MOBILE_PORT=5001
```

## Démarrage

Pour lancer l'API mobile :
```bash
cd backend
npm start
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