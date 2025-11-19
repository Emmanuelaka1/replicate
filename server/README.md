# Serveur API REST - Guide de démarrage

## 🚀 Installation

```bash
cd server
npm install
```

## ⚙️ Configuration

1. Créer le fichier `.env` :
```bash
cp .env.example .env
```

2. Modifier les variables si nécessaire

## 🎯 Démarrage

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 🧪 Tester le serveur

### Vérification de l'état
```bash
curl http://localhost:3000/api/health
```

### Récupérer les rapports
```bash
curl http://localhost:3000/api/reports
```

### Créer une réplication
```bash
curl -X POST http://localhost:3000/api/replications \
  -H "Content-Type: application/json" \
  -d '{
    "boite": "AAAA",
    "app": "newapp",
    "database": "TESTDB",
    "supportType": "POSTGRESQL",
    "schema": "public",
    "supportConceptuel": "TEST_TABLE",
    "clientType": "SOURCE"
  }'
```

## 📊 Base de données

Cette version utilise une base en mémoire. Pour passer à PostgreSQL :

1. Créer la base de données :
```sql
CREATE DATABASE replications_db;
```

2. Exécuter le script SQL (voir REST-API-GUIDE.md)

3. Installer le client PostgreSQL :
```bash
npm install pg
```

4. Remplacer la base mémoire par des requêtes SQL

## 🔍 Endpoints disponibles

Voir le fichier `REST-API-GUIDE.md` pour la documentation complète.

## 📝 Logs

Les logs du serveur affichent :
- 📊 Requêtes GET
- ✅ Créations POST
- ✏️ Modifications PUT
- 🗑️ Suppressions DELETE
- 📋 Duplications
- 🔎 Recherches
- ❌ Erreurs

## 🛠️ Développement

Structure du serveur :
- `server.js` - Point d'entrée et routes
- `package.json` - Dépendances
- `.env` - Configuration
- `uploads/` - Fichiers uploadés (temporaires)
