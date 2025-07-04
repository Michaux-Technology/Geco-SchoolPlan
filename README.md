# 📚 Geco-SchoolPlan

**Geco-SchoolPlan** est une application web de **gestion d'emploi du temps scolaire** avec une **API mobile sécurisée**.

Elle se compose de :
- 🔧 un **frontend web** pour la gestion et la planification (modification, affectation, visualisation),
- 📱 une **application mobile** pour les enseignants et les élèves, en mode lecture seule :  
  👉 [Geco-SchoolPlan-App](https://github.com/Michaux-Technology/Geco-SchoolPlan-App)

⚠️ Ce projet est encore en **cours de développement actif**.

---

## 🚀 Fonctionnalités principales

- 🔐 Authentification des utilisateurs (enseignants et élèves)
- 📆 Gestion des cours et des emplois du temps
- 🡭 Gestion des surveillances
- 📲 API mobile sécurisée
- 🔒 Authentification par **JWT**
- 🛡️ Limitation des tentatives de connexion
- 🧩 Contrôle d’accès basé sur les rôles

---

## 🧰 Prérequis techniques

- [Node.js](https://nodejs.org)
- [MongoDB](https://www.mongodb.com)
- `npm` ou `yarn`

---

## ⚙️ Installation locale

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/Michaux-Technology/Geco-SchoolPlan.git
   cd Geco-SchoolPlan
   ```

2. Installez les dépendances **backend** :
   ```bash
   cd backend
   npm install
   ```

3. Installez les dépendances **frontend** :
   ```bash
   cd ../frontend
   npm install
   ```

4. Créez un fichier `.env` dans `backend` avec les variables suivantes :
   ```env
   MONGODB_URI=mongodb://localhost:27017/Geco-SchoolPlan
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

---

## ▶️ Lancement de l’application

### Backend :
```bash
cd backend
npm start
```

### Frontend :
```bash
cd frontend
npm run dev
```

---

## 📱 API REST – Endpoints principaux

| Méthode | Endpoint                  | Description                   |
|---------|---------------------------|-------------------------------|
| POST    | `/api/mobile/login`       | Connexion utilisateur         |
| GET     | `/api/mobile/cours`       | Récupérer les cours           |
| GET     | `/api/mobile/enseignants` | Liste des enseignants         |
| GET     | `/api/mobile/surveillances` | Liste des surveillances     |
| GET     | `/api/mobile/status`      | Statut du serveur             |

---

## 🛡️ Sécurité

- 🔐 Authentification par **JWT**
- 🛡️ Limitation des connexions abusives
- 🔒 Accès restreint selon les rôles

---

## 🤝 Contribution

Les contributions sont les bienvenues !  
N'hésitez pas à **ouvrir une issue** ou une **pull request** pour suggérer des améliorations ou corriger des bugs.

---

## 📄 Licence : Business Source License 1.1 (BSL 1.1)

Ce projet est distribuent sous la **Business Source License 1.1**, ce qui signifie :

- ✅ **Gratuit** pour le développement, test, recherche et usage personnel
- ❌ **Interdit pour tout usage en production** sans une licence commerciale

### 🔐 Usage commercial

L'utilisation de **Geco-SchoolPlan** dans un environnement de production (écoles, entreprises, serveurs publics, etc.) nécessite une **licence commerciale**.

📩 Contact pour licence : **michaux@free.fr**

---

## ⏳ Ouverture future

À partir du **4 juillet 2030**, ce projet passera automatiquement sous licence **GPL v3** (libre/open source complète).
