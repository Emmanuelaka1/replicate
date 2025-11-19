# 🚀 Application de Suivi des Réplications - Version REST API

Cette version de l'application sauvegarde les données dans une base de données via un serveur REST API.

## 📋 Vue d'ensemble

L'application se compose de deux parties :

1. **Frontend** (Vue 3 + TypeScript) - Interface utilisateur
2. **Backend** (Node.js + Express) - API REST + Base de données

## 🏗️ Architecture

```
replicate/
├── src/                          # Frontend Vue.js
│   ├── api/
│   │   ├── replicationRestApi.ts # 🆕 Client API REST
│   │   └── reportTestApi.ts      # API Mock (ancienne version)
│   ├── components/
│   ├── views/
│   │   └── reporting/
│   │       └── reportComponent.vue
│   └── stores/
├── server/                       # 🆕 Backend Node.js
│   ├── server.js                 # Serveur Express
│   ├── database.sql              # Script SQL PostgreSQL
│   ├── package.json
│   └── .env
├── .env                          # Config frontend
└── [Documentation]
    ├── REST-API-GUIDE.md         # 📚 Documentation API complète
    ├── MIGRATION-GUIDE.md        # 🔄 Guide de migration
    └── README-REST.md            # Ce fichier
```

## ⚡ Démarrage rapide

### 1. Installation

```bash
# Installer les dépendances du frontend
npm install

# Installer les dépendances du serveur
cd server
npm install
cd ..
```

### 2. Configuration

#### Frontend (.env à la racine)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_DEBUG=true
```

#### Backend (server/.env)
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Lancer l'application

#### Terminal 1 : Backend
```bash
cd server
npm run dev
```

#### Terminal 2 : Frontend
```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

## 🔗 Endpoints API disponibles

### Reports
- `GET /api/reports` - Liste des rapports avec filtres
- `GET /api/reports/export` - Export JSON
- `POST /api/reports/import` - Import JSON
- `GET /api/reports/statistics` - Statistiques globales

### Replications
- `GET /api/replications/:id/status` - Détails d'une réplication
- `POST /api/replications` - Créer une réplication
- `PUT /api/replications/:id` - Modifier une réplication
- `DELETE /api/replications/:id` - Supprimer une réplication
- `POST /api/replications/:id/duplicate` - Dupliquer avec enfants
- `GET /api/replications/:id/history` - Historique des statuts
- `POST /api/replications/:id/status-change` - Changer le statut
- `GET /api/replications/search?q=...` - Recherche globale

### Autres
- `GET /api/boites` - Liste des boîtes applicatives
- `GET /api/health` - État du serveur

📚 **Documentation complète** : Voir [REST-API-GUIDE.md](./REST-API-GUIDE.md)

## 🗄️ Base de données

### Option 1 : Base mémoire (par défaut)

Les données sont stockées en mémoire dans le serveur. **Attention** : les données sont perdues au redémarrage.

### Option 2 : PostgreSQL (recommandé pour production)

1. **Installer PostgreSQL**
   ```bash
   # Windows (avec Chocolatey)
   choco install postgresql
   
   # macOS
   brew install postgresql
   
   # Linux
   sudo apt-get install postgresql
   ```

2. **Créer la base de données**
   ```bash
   psql -U postgres
   CREATE DATABASE replications_db;
   \q
   ```

3. **Exécuter le script SQL**
   ```bash
   psql -U postgres -d replications_db -f server/database.sql
   ```

4. **Configurer la connexion** (server/.env)
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=replications_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

5. **Activer PostgreSQL dans le serveur**
   
   Décommenter les sections PostgreSQL dans `server/server.js` (instructions incluses dans le fichier)

## 🎯 Fonctionnalités

### ✅ Implémentées

- [x] Affichage hiérarchique des réplications (Boîte > App > DB > Schema > Réplication)
- [x] Recherche multi-critères (boîte, app, db, schema, support)
- [x] CRUD complet (Créer, Lire, Modifier, Supprimer)
- [x] Duplication récursive avec tous les enfants
- [x] Label personnalisable lors de la duplication
- [x] Export/Import JSON avec hiérarchie complète
- [x] Gestion des statuts (ACTIVE, INACTIVE, ERROR, PENDING)
- [x] Historique des changements de statut
- [x] API REST complète avec validation
- [x] Support multi-utilisateurs
- [x] Statistiques et recherche globale

### 🚧 À venir (optionnel)

- [ ] Authentification JWT
- [ ] Gestion des permissions (habilitations)
- [ ] Notifications temps réel (WebSocket)
- [ ] Audit trail complet
- [ ] Tests automatisés (Jest/Supertest)
- [ ] Documentation Swagger/OpenAPI
- [ ] Rate limiting
- [ ] Cache Redis

## 🔄 Migration depuis l'API Mock

Si vous avez déjà l'ancienne version avec API Mock :

1. **Lire le guide de migration** : [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)

2. **Résumé des changements** :
   ```typescript
   // Avant
   import api from '@/api/reportTestApi'
   await api.reportApi.findReports(criteria)
     .then(d => d.json())
     .then(reports => { ... })
   
   // Après
   import api from '@/api/replicationRestApi'
   const reports = await api.reportApi.findReports(criteria)
   ```

3. **Tester progressivement** avec feature flag (voir MIGRATION-GUIDE.md)

## 🧪 Tests

### Test de connexion au serveur
```bash
curl http://localhost:3000/api/health
```

### Test de récupération des données
```bash
curl http://localhost:3000/api/reports
```

### Test de création
```bash
curl -X POST http://localhost:3000/api/replications \
  -H "Content-Type: application/json" \
  -d '{
    "boite": "AAAA",
    "app": "testapp",
    "database": "TESTDB",
    "supportType": "POSTGRESQL",
    "schema": "public",
    "supportConceptuel": "TEST_TABLE",
    "clientType": "SOURCE"
  }'
```

## 📊 Schéma de base de données

```sql
replications
├── id (PK)
├── code_boite (FK -> boites)
├── app
├── database_name
├── support_type
├── schema_name
├── support_conceptuel
├── client_type
└── [timestamps]

replication_status_history
├── id (PK)
├── replication_id (FK -> replications)
├── status
├── changed_at
├── changed_by
└── comment

boites
├── code (PK)
├── libelle
└── description

users
├── id (PK)
├── email
├── username
└── habilitation
```

## 🐛 Dépannage

### Problème : CORS Error
```javascript
// server/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

### Problème : Connexion refusée
Vérifier que le serveur est démarré :
```bash
cd server
npm run dev
# Doit afficher : "Serveur API démarré sur http://localhost:3000"
```

### Problème : Variables d'environnement non chargées
1. Vérifier que `.env` existe à la racine
2. Redémarrer Vite (`npm run dev`)
3. Variables doivent commencer par `VITE_`

### Problème : Données perdues au redémarrage
Normal avec base mémoire. Solutions :
1. Implémenter PostgreSQL
2. Sauvegarder périodiquement dans un fichier JSON

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [REST-API-GUIDE.md](./REST-API-GUIDE.md) | Documentation complète de l'API REST |
| [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) | Guide de migration Mock → REST |
| [server/README.md](./server/README.md) | Guide du serveur backend |
| [README.md](./README.md) | Documentation originale de l'application |

## 🔐 Sécurité

### Version actuelle (développement)
- Pas d'authentification
- Pas de validation des permissions
- CORS ouvert

### Recommandations pour production
1. Implémenter JWT pour l'authentification
2. Valider les permissions (habilitations)
3. Configurer CORS strictement
4. Utiliser HTTPS
5. Implémenter rate limiting
6. Valider toutes les entrées (Joi/Zod)
7. Logs structurés avec Winston

## 🚀 Déploiement

### Backend
```bash
cd server
npm start
```

### Frontend
```bash
npm run build
# Déployer le dossier dist/
```

### Variables d'environnement production
```env
# Frontend .env.production
VITE_API_BASE_URL=https://api.production.com/api
VITE_APP_ENV=production
VITE_DEBUG=false

# Backend server/.env
PORT=3000
NODE_ENV=production
DB_HOST=production-db.example.com
DB_SSL=true
```

## 📈 Performances

### Optimisations implémentées
- Index sur les colonnes fréquemment recherchées
- Vue matérialisée pour les statistiques
- Lazy loading de la hiérarchie
- Pagination côté serveur (à implémenter)

### Recommandations
- Implémenter cache Redis pour les requêtes fréquentes
- Ajouter CDN pour les assets statiques
- Utiliser connection pooling PostgreSQL
- Comprimer les réponses (gzip)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 👥 Auteurs

- Version originale avec API Mock
- Version REST API - Migration complète avec serveur backend

## 🙏 Remerciements

- Vue.js et Element Plus pour l'UI
- Express.js pour l'API REST
- PostgreSQL pour la persistance
- La communauté open source

## 📞 Support

- 📧 Email : support@example.com
- 🐛 Issues : [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Wiki : [GitHub Wiki](https://github.com/your-repo/wiki)

---

**Note** : Cette version REST API est compatible avec l'ancienne version Mock. Vous pouvez basculer entre les deux en changeant l'import dans `reportComponent.vue`.
