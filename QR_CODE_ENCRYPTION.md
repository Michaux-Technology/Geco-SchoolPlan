# Cryptage des QR Codes - Geco SchoolPlan

## 🔐 Sécurité des QR Codes

Le système de QR codes de Geco SchoolPlan inclut maintenant un cryptage AES-256-CBC pour protéger les informations sensibles (nom d'utilisateur et mot de passe) transmises via les QR codes.

## ⚙️ Configuration

### Variables d'environnement requises

#### Frontend (.env)
```env
VITE_ENCRYPTION_KEY=votre_cle_secrete_unique_32_caracteres
```

#### Backend (.env)
```env
ENCRYPTION_KEY=votre_cle_secrete_unique_32_caracteres
```

**⚠️ Important :** La même clé doit être utilisée côté frontend et backend.

## 🔧 Fonctionnement

### 1. Génération des QR Codes (Frontend)
- Les données sont cryptées avec AES-256-CBC
- Un timestamp est ajouté pour limiter la validité à 24h
- Format des données cryptées : `{backend, schoolName, username, password, role, timestamp, version}`

### 2. Authentification Mobile (Backend)
- Décryptage automatique des données QR
- Validation du timestamp (expiration après 24h)
- Authentification classique si pas de QR code fourni

## 🛡️ Avantages de sécurité

1. **Protection des identifiants** : Les mots de passe ne sont plus visibles en clair
2. **Expiration automatique** : Les QR codes expirent après 24h
3. **Clé unique par école** : Chaque école peut avoir sa propre clé de cryptage
4. **Rétrocompatibilité** : L'authentification classique reste possible

## 📱 Utilisation

### Pour les applications mobiles
1. Scanner le QR code avec l'application mobile
2. L'application envoie les données cryptées au serveur
3. Le serveur décrypte et valide automatiquement
4. Authentification transparente pour l'utilisateur

### Génération des QR Codes
1. Accéder à la page QR Code dans l'interface web
2. Les QR codes sont générés automatiquement avec cryptage
3. Copier ou télécharger les QR codes sécurisés

## 🔑 Génération d'une clé sécurisée

```bash
# Générer une clé aléatoire de 32 caractères
openssl rand -base64 24
```

## ⚠️ Recommandations de sécurité

1. **Clé unique** : Utilisez une clé différente pour chaque école
2. **Rotation** : Changez la clé régulièrement (tous les 6 mois)
3. **Stockage sécurisé** : Ne partagez jamais la clé de cryptage
4. **Backup** : Sauvegardez la clé de manière sécurisée

## 🔄 Migration depuis l'ancien système

Le système est rétrocompatible. Les anciennes applications mobiles peuvent toujours utiliser l'authentification classique (username/password) si elles ne supportent pas encore les QR codes cryptés.

## 📋 Checklist de déploiement

- [ ] Générer une clé de cryptage sécurisée
- [ ] Configurer VITE_ENCRYPTION_KEY dans le frontend
- [ ] Configurer ENCRYPTION_KEY dans le backend
- [ ] Tester la génération des QR codes
- [ ] Tester l'authentification mobile
- [ ] Former les utilisateurs sur la nouvelle fonctionnalité 