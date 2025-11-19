# Guide de Migration - API Mock vers API REST

## 📋 Vue d'ensemble

Ce guide vous aide à migrer l'application de l'API Mock (`reportTestApi.ts`) vers l'API REST (`replicationRestApi.ts`) avec un serveur backend.

## ✅ Checklist de migration

### 1. Configuration de l'environnement

- [x] Créer le fichier `.env` à la racine du projet
- [x] Configurer `VITE_API_BASE_URL=http://localhost:3000/api`
- [x] Installer les dépendances du serveur (`cd server && npm install`)
- [ ] Démarrer le serveur (`npm run dev` dans le dossier server)

### 2. Modifications du code frontend

#### Étape 1 : Remplacer l'import dans `reportComponent.vue`

**Avant :**
```typescript
import api from '@/api/reportTestApi'
```

**Après :**
```typescript
import api from '@/api/replicationRestApi'
```

#### Étape 2 : Modifier les appels API

**Avant (API Mock) :**
```typescript
await api.reportApi
  .findReports(infoSearch.value)
  .then((d: Response) => d.json())
  .then((reports: any[]) => {
    for (const report of reports) {
      boiteReports.value.push(new ReportBoite(report, infoSearch.value, keyStore.key++))
    }
  })
  .catch((error: any) => {
    console.error('Erreur:', error)
  })
```

**Après (API REST) :**
```typescript
try {
  const reports = await api.reportApi.findReports(infoSearch.value)
  
  for (const report of reports) {
    boiteReports.value.push(new ReportBoite(report, infoSearch.value, keyStore.key++))
  }
} catch (error) {
  console.error('Erreur:', error)
  ElNotification({
    title: 'Erreur',
    message: error instanceof Error ? error.message : 'Erreur inconnue',
    type: 'error',
    position: 'top-right'
  })
}
```

#### Étape 3 : Mise à jour de toutes les fonctions

Voici les modifications à apporter pour chaque fonction :

**1. findReportSce()**
```typescript
async function findReportSce() {
  boiteReports.value = []

  try {
    const reports = await api.reportApi.findReports(infoSearch.value)
    
    for (const report of reports) {
      boiteReports.value.push(new ReportBoite(report, infoSearch.value, keyStore.key++))
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports:', error)
    ElNotification({
      title: 'Erreur',
      message: 'Impossible de récupérer les rapports',
      type: 'error',
      position: 'top-right'
    })
  }
}
```

**2. replicationSearch()**
```typescript
async function replicationSearch(r: number) {
  try {
    const res = await api.replicationApi.getReplicationAndStatusById(r)
    rplToDel.value = res
  } catch (error) {
    console.error('Erreur lors de la récupération de la réplication:', error)
    ElNotification({
      title: 'Erreur',
      message: 'Impossible de récupérer la réplication',
      type: 'error',
      position: 'top-right'
    })
  }
}
```

**3. onDeleteSubmit()**
```typescript
async function onDeleteSubmit(r: ReplicationAndStatusDto) {
  if (r.replication?.id) {
    try {
      await api.replicationApi.deleteReplication(r.replication.id)
      confirmPopUp.value = false
      getReports()
      successMsg('Réplication supprimée !')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      ElNotification({
        title: 'Erreur',
        message: error instanceof Error ? error.message : 'Impossible de supprimer la réplication',
        type: 'error',
        position: 'top-right'
      })
    }
  }
}
```

**4. exportData()** - Pas de changement nécessaire (utilise déjà Blob côté client)

**5. handleImport()** - Pas de changement nécessaire (le parsing reste côté client)

### 3. Fonctionnalités avancées (optionnel)

#### Utiliser la duplication côté serveur

Au lieu de dupliquer côté client, vous pouvez utiliser l'endpoint du serveur :

```typescript
async function onDuplicateConfirm() {
  duplicatePopUp.value = false
  
  try {
    if (rplToDuplicate.value.id) {
      // Duplication via l'API REST
      const duplicated = await api.replicationApi.duplicateReplication(
        parseInt(rplToDuplicate.value.id),
        duplicateLabel.value || `${rplToDuplicate.value.label} (copie)`
      )
      
      // Recharger les données
      await getReports()
      
      ElNotification({
        title: 'Succès',
        message: 'Élément dupliqué avec succès',
        type: 'success',
        position: 'top-right'
      })
    }
  } catch (error) {
    console.error('Erreur lors de la duplication:', error)
    ElNotification({
      title: 'Erreur',
      message: error instanceof Error ? error.message : 'Impossible de dupliquer',
      type: 'error',
      position: 'top-right'
    })
  }
}
```

#### Utiliser l'export/import via le serveur

```typescript
// Export via le serveur
async function exportData() {
  try {
    const blob = await api.reportApi.exportData(infoSearch.value)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `replications-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElNotification({
      title: 'Succès',
      message: 'Export réussi',
      type: 'success',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    ElNotification({
      title: 'Erreur',
      message: 'Impossible d\'exporter',
      type: 'error',
      position: 'top-right'
    })
  }
}

// Import via le serveur
async function handleImport(file: any) {
  try {
    const result = await api.reportApi.importData(file.raw)
    
    // Recharger les données
    await getReports()
    
    ElNotification({
      title: 'Succès',
      message: result.message,
      type: 'success',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Erreur lors de l\'import:', error)
    ElNotification({
      title: 'Erreur',
      message: error instanceof Error ? error.message : 'Impossible d\'importer',
      type: 'error',
      position: 'top-right'
    })
  }
}
```

### 4. Tests de validation

Après migration, vérifier :

1. **Chargement initial**
   - [ ] Les rapports s'affichent au démarrage
   - [ ] La hiérarchie est correcte (Boîte > App > DB > Schema > Réplication)

2. **Recherche**
   - [ ] La recherche par boîte fonctionne
   - [ ] La recherche par app fonctionne
   - [ ] Les filtres multiples fonctionnent ensemble

3. **CRUD**
   - [ ] Création d'une réplication
   - [ ] Modification d'une réplication
   - [ ] Suppression d'une réplication
   - [ ] Duplication avec tous les enfants

4. **Export/Import**
   - [ ] Export génère un fichier JSON valide
   - [ ] Import reconstruit la hiérarchie correctement

5. **Gestion des erreurs**
   - [ ] Serveur arrêté : message d'erreur clair
   - [ ] Données invalides : validation côté serveur
   - [ ] Timeout : gestion appropriée

## 🔄 Stratégie de migration progressive

Si vous souhaitez migrer progressivement :

### Option 1 : Feature Flag

Créer un switch pour basculer entre Mock et REST :

```typescript
// config.ts
export const USE_REST_API = import.meta.env.VITE_USE_REST_API === 'true'

// reportComponent.vue
import mockApi from '@/api/reportTestApi'
import restApi from '@/api/replicationRestApi'
import { USE_REST_API } from '@/config'

const api = USE_REST_API ? restApi : mockApi
```

### Option 2 : Migration par fonctionnalité

1. Semaine 1 : Lecture seule (GET /api/reports)
2. Semaine 2 : Suppression (DELETE)
3. Semaine 3 : Création/Modification (POST/PUT)
4. Semaine 4 : Fonctionnalités avancées (Duplication, Export/Import)

## 🐛 Problèmes courants

### Problème 1 : CORS Error
**Symptôme :** `Access-Control-Allow-Origin` error dans la console

**Solution :**
```javascript
// server.js
const cors = require('cors')
app.use(cors({
  origin: 'http://localhost:5173', // URL de votre frontend
  credentials: true
}))
```

### Problème 2 : Serveur non démarré
**Symptôme :** `net::ERR_CONNECTION_REFUSED`

**Solution :**
```bash
cd server
npm run dev
# Vérifier que le message "Serveur API démarré" s'affiche
```

### Problème 3 : Variables d'environnement non chargées
**Symptôme :** `undefined` pour `import.meta.env.VITE_API_BASE_URL`

**Solution :**
1. Vérifier que le fichier `.env` existe à la racine
2. Redémarrer le serveur de développement Vite (`npm run dev`)
3. Variables doivent commencer par `VITE_`

### Problème 4 : Données non persistées
**Symptôme :** Les données disparaissent au redémarrage du serveur

**Solution :** C'est normal avec la base mémoire. Pour persister :
1. Implémenter PostgreSQL (voir REST-API-GUIDE.md)
2. Ou sauvegarder périodiquement dans un fichier JSON :

```javascript
// server.js
const fs = require('fs')

// Sauvegarder toutes les 5 minutes
setInterval(() => {
  fs.writeFileSync('data/replications.json', JSON.stringify(replications, null, 2))
}, 300000)

// Charger au démarrage
if (fs.existsSync('data/replications.json')) {
  replications = JSON.parse(fs.readFileSync('data/replications.json', 'utf8'))
}
```

## 📊 Comparaison Mock vs REST

| Fonctionnalité | API Mock | API REST |
|----------------|----------|----------|
| Persistance | ❌ Mémoire volatile | ✅ Base de données |
| Multi-utilisateurs | ❌ Données locales | ✅ Données partagées |
| Performances | ⚡ Très rapide | ⚠️ Dépend du réseau |
| Développement | ✅ Simple | ⚠️ Serveur requis |
| Production | ❌ Non adapté | ✅ Recommandé |
| Tests | ✅ Facile | ⚠️ Mock nécessaire |

## 🎯 Recommandations

1. **Développement local** : Utiliser l'API Mock pour travailler sans serveur
2. **Tests d'intégration** : Utiliser l'API REST avec serveur de test
3. **Production** : Obligatoire d'utiliser l'API REST avec PostgreSQL

## 📞 Support

En cas de problème :
1. Vérifier les logs du serveur (`server/`)
2. Vérifier la console du navigateur (F12)
3. Tester les endpoints avec `curl` ou Postman
4. Consulter `REST-API-GUIDE.md`

## ✨ Prochaines étapes

Après migration réussie :
- [ ] Implémenter PostgreSQL
- [ ] Ajouter l'authentification JWT
- [ ] Ajouter la validation des données (Joi/Zod)
- [ ] Implémenter le rate limiting
- [ ] Ajouter les logs structurés (Winston)
- [ ] Créer des tests d'intégration (Jest/Supertest)
- [ ] Documenter l'API avec Swagger/OpenAPI
