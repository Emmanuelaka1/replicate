# Guide API REST - Application de Suivi des Réplications

## 📡 Vue d'ensemble

Cette application utilise une API REST pour persister et gérer les données des réplications. Le service `replicationRestApi.ts` remplace l'API Mock et communique avec un serveur backend réel.

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_API_TIMEOUT=30000
VITE_DEBUG=true
```

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## 🌐 Endpoints de l'API

### 1. Rapports (Reports)

#### GET `/api/reports`
Récupère les rapports selon les critères de recherche.

**Query Parameters:**
- `codeBoite` (string, optional) - Code de la boîte applicative
- `app` (string, optional) - Nom de l'application
- `db` (string, optional) - Nom de la base de données
- `schema` (string, optional) - Nom du schéma
- `support` (string, optional) - Support conceptuel
- `typeSupport` (string, optional) - Type de support

**Response:**
```json
[
  {
    "replication": {
      "id": 1,
      "boite": "AAAA",
      "app": "cardvirtrplsource",
      "database": "V01DBA",
      "supportType": "POSTGRESQL",
      "schema": "public",
      "supportConceptuel": "T05CARV",
      "clientType": "SOURCE"
    },
    "statuses": ["ACTIVE"],
    "count": 5
  }
]
```

#### GET `/api/reports/export`
Exporte les données au format JSON.

**Query Parameters:** (mêmes que GET `/api/reports`)

**Response:** Fichier JSON téléchargeable

#### POST `/api/reports/import`
Importe des données depuis un fichier JSON.

**Body:** FormData avec le fichier
- `file` (File) - Fichier JSON à importer

**Response:**
```json
{
  "count": 10,
  "message": "10 réplications importées avec succès"
}
```

#### GET `/api/reports/statistics`
Obtient les statistiques globales des réplications.

**Response:**
```json
{
  "total": 150,
  "active": 120,
  "inactive": 30,
  "byType": {
    "SOURCE": 90,
    "CIBLE": 60
  },
  "byBoite": {
    "AAAA": 50,
    "BBBB": 100
  }
}
```

### 2. Réplications (Replications)

#### GET `/api/replications/{id}/status`
Récupère une réplication avec son statut par ID.

**Path Parameters:**
- `id` (number) - ID de la réplication

**Response:**
```json
[
  {
    "replication": {
      "id": 1,
      "boite": "AAAA",
      "app": "cardvirtrplsource",
      "clientType": "SOURCE"
    },
    "statuses": ["ACTIVE"],
    "lastUpdate": "2025-11-19T10:30:00Z"
  }
]
```

#### POST `/api/replications`
Crée une nouvelle réplication.

**Body:**
```json
{
  "boite": "AAAA",
  "app": "newapp",
  "database": "NEWDB",
  "supportType": "POSTGRESQL",
  "schema": "public",
  "supportConceptuel": "TABLE_NAME",
  "clientType": "SOURCE"
}
```

**Response:**
```json
{
  "id": 123,
  "boite": "AAAA",
  "app": "newapp",
  "createdAt": "2025-11-19T10:30:00Z"
}
```

#### PUT `/api/replications/{id}`
Met à jour une réplication existante.

**Path Parameters:**
- `id` (number) - ID de la réplication

**Body:**
```json
{
  "supportConceptuel": "NEW_TABLE_NAME",
  "clientType": "CIBLE"
}
```

**Response:** Objet ReplicationDto mis à jour

#### DELETE `/api/replications/{id}`
Supprime une réplication.

**Path Parameters:**
- `id` (number) - ID de la réplication

**Response:** 204 No Content

#### POST `/api/replications/{id}/duplicate`
Duplique une réplication avec ses enfants.

**Path Parameters:**
- `id` (number) - ID de la réplication à dupliquer

**Body:**
```json
{
  "newLabel": "T05CARV (copie)"
}
```

**Response:** Objet ReplicationDto de la copie créée

#### GET `/api/replications/{id}/history`
Récupère l'historique des statuts d'une réplication.

**Path Parameters:**
- `id` (number) - ID de la réplication

**Response:**
```json
[
  {
    "status": "ACTIVE",
    "changedAt": "2025-11-19T10:00:00Z",
    "changedBy": "user@example.com",
    "comment": "Activation initiale"
  },
  {
    "status": "INACTIVE",
    "changedAt": "2025-11-18T15:30:00Z",
    "changedBy": "admin@example.com",
    "comment": "Maintenance"
  }
]
```

#### POST `/api/replications/{id}/status-change`
Crée une demande de changement de statut.

**Path Parameters:**
- `id` (number) - ID de la réplication

**Body:**
```json
{
  "newStatus": "INACTIVE",
  "comment": "Arrêt pour maintenance"
}
```

**Response:**
```json
{
  "requestId": 456,
  "status": "PENDING",
  "createdAt": "2025-11-19T10:30:00Z"
}
```

#### GET `/api/replications/search`
Recherche globale dans les réplications.

**Query Parameters:**
- `q` (string, required) - Terme de recherche

**Response:**
```json
[
  {
    "replication": {
      "id": 1,
      "boite": "AAAA",
      "supportConceptuel": "T05CARV"
    },
    "statuses": ["ACTIVE"],
    "matchField": "supportConceptuel"
  }
]
```

### 3. Boîtes Applicatives

#### GET `/api/boites`
Récupère toutes les boîtes applicatives.

**Response:**
```json
[
  {
    "code": "AAAA",
    "libelle": "Base A - Application principale"
  },
  {
    "code": "BBBB",
    "libelle": "Base B - Application secondaire"
  }
]
```

## 🔄 Migration depuis l'API Mock

### Étape 1 : Remplacer l'import

**Avant (API Mock):**
```typescript
import api from '@/api/reportTestApi'
```

**Après (API REST):**
```typescript
import api from '@/api/replicationRestApi'
```

### Étape 2 : Ajuster les appels asynchrones

L'API REST retourne des Promises natives au lieu de Response objects.

**Avant:**
```typescript
await api.reportApi.findReports(criteria)
  .then((d: Response) => d.json())
  .then((reports: NodeReportDto[]) => {
    // Traiter les rapports
  })
```

**Après:**
```typescript
try {
  const reports = await api.reportApi.findReports(criteria)
  // Traiter les rapports
} catch (error) {
  console.error('Erreur:', error)
}
```

### Étape 3 : Gestion des erreurs améliorée

```typescript
try {
  await api.replicationApi.deleteReplication(id)
  ElNotification({
    title: 'Succès',
    message: 'Réplication supprimée',
    type: 'success'
  })
} catch (error) {
  ElNotification({
    title: 'Erreur',
    message: error instanceof Error ? error.message : 'Erreur inconnue',
    type: 'error'
  })
}
```

## 🔐 Authentification

### Headers requis

```typescript
headers: {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer YOUR_TOKEN' // Si nécessaire
}
```

### Ajouter l'authentification

Modifiez la méthode `getHeaders()` dans `replicationRestApi.ts` :

```typescript
private getHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token')
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}
```

## 🛠️ Backend Node.js/Express - Exemple

Voici un exemple de serveur Express pour l'API :

```javascript
// server.js
const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// Base de données simulée (remplacer par une vraie BDD)
let replications = []

// GET /api/reports
app.get('/api/reports', (req, res) => {
  const { codeBoite, app, db, schema } = req.query
  
  let filtered = replications
  
  if (codeBoite) filtered = filtered.filter(r => r.replication.boite === codeBoite)
  if (app) filtered = filtered.filter(r => r.replication.app === app)
  if (db) filtered = filtered.filter(r => r.replication.database === db)
  if (schema) filtered = filtered.filter(r => r.replication.schema === schema)
  
  res.json(filtered)
})

// POST /api/replications
app.post('/api/replications', (req, res) => {
  const newReplication = {
    id: replications.length + 1,
    ...req.body,
    createdAt: new Date().toISOString()
  }
  
  replications.push({
    replication: newReplication,
    statuses: ['ACTIVE'],
    count: 0
  })
  
  res.status(201).json(newReplication)
})

// DELETE /api/replications/:id
app.delete('/api/replications/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = replications.findIndex(r => r.replication.id === id)
  
  if (index === -1) {
    return res.status(404).json({ error: 'Réplication non trouvée' })
  }
  
  replications.splice(index, 1)
  res.status(204).send()
})

// POST /api/replications/:id/duplicate
app.post('/api/replications/:id/duplicate', (req, res) => {
  const id = parseInt(req.params.id)
  const original = replications.find(r => r.replication.id === id)
  
  if (!original) {
    return res.status(404).json({ error: 'Réplication non trouvée' })
  }
  
  const duplicate = {
    replication: {
      ...original.replication,
      id: replications.length + 1,
      supportConceptuel: req.body.newLabel
    },
    statuses: [...original.statuses],
    count: original.count
  }
  
  replications.push(duplicate)
  res.status(201).json(duplicate.replication)
})

app.listen(PORT, () => {
  console.log(`Serveur API démarré sur http://localhost:${PORT}`)
})
```

## 📊 Base de données

### Schéma SQL recommandé

```sql
-- Table des réplications
CREATE TABLE replications (
  id SERIAL PRIMARY KEY,
  code_boite VARCHAR(50) NOT NULL,
  app VARCHAR(100) NOT NULL,
  database_name VARCHAR(100) NOT NULL,
  support_type VARCHAR(50) NOT NULL,
  schema_name VARCHAR(100) NOT NULL,
  support_conceptuel VARCHAR(200) NOT NULL,
  client_type VARCHAR(20) NOT NULL CHECK (client_type IN ('SOURCE', 'CIBLE')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- Table des statuts
CREATE TABLE replication_statuses (
  id SERIAL PRIMARY KEY,
  replication_id INTEGER REFERENCES replications(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR', 'PENDING')),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by VARCHAR(100),
  comment TEXT
);

-- Table des boîtes applicatives
CREATE TABLE boites (
  code VARCHAR(50) PRIMARY KEY,
  libelle VARCHAR(200) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true
);

-- Index pour les recherches
CREATE INDEX idx_replications_boite ON replications(code_boite);
CREATE INDEX idx_replications_app ON replications(app);
CREATE INDEX idx_replications_support ON replications(support_conceptuel);
CREATE INDEX idx_statuses_replication ON replication_statuses(replication_id);
```

## 🧪 Tests

### Exemple avec fetch natif

```typescript
// Test de connexion
async function testConnection() {
  try {
    const response = await fetch('http://localhost:3000/api/reports')
    const data = await response.json()
    console.log('✅ Connexion réussie:', data)
  } catch (error) {
    console.error('❌ Erreur de connexion:', error)
  }
}
```

## 📝 Codes de statut HTTP

- `200 OK` - Requête réussie
- `201 Created` - Ressource créée
- `204 No Content` - Suppression réussie
- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Non authentifié
- `403 Forbidden` - Non autorisé
- `404 Not Found` - Ressource non trouvée
- `500 Internal Server Error` - Erreur serveur

## 🔍 Debugging

Activer les logs de debug dans le fichier `.env` :

```env
VITE_DEBUG=true
```

Ajouter des logs dans `replicationRestApi.ts` :

```typescript
private async handleResponse<T>(response: Response): Promise<T> {
  if (import.meta.env.VITE_DEBUG === 'true') {
    console.log('🔍 API Request:', response.url)
    console.log('📊 Status:', response.status)
  }
  
  // ... reste du code
}
```

## 🚀 Déploiement

### Production

1. Mettre à jour `.env.production` :
```env
VITE_API_BASE_URL=https://api.production.com/api
VITE_APP_ENV=production
VITE_DEBUG=false
```

2. Build :
```bash
npm run build
```

3. Déployer le dossier `dist/`

## 📚 Ressources

- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
