# 🚀 Guide de démarrage rapide - Version REST

## Problème résolu

✅ **Fonction `load` ne fonctionnait pas** car elle utilisait l'ancienne API Mock au lieu de l'API REST.

### Modifications apportées :

1. **Nouveau fichier `ReportModelRest.ts`**
   - Utilise `import api from '@/api/replicationRestApi'` au lieu de `reportTestApi`
   - Méthode `initData` modifiée pour utiliser `async/await` avec l'API REST
   - Gestion d'erreurs améliorée

2. **Mise à jour de `reportComponentRest.vue`**
   - Import depuis `ReportModelRest.ts` au lieu de `ReportModel.ts`

3. **Correction de `replicationRestApi.ts`**
   - Ajout de `exportData` et `importData` dans l'export par défaut

## 📋 Étapes pour tester

### 1. Démarrer le serveur backend

Ouvrir un terminal PowerShell et exécuter :

```powershell
cd server
npm run dev
```

Vous devriez voir :
```
╔════════════════════════════════════════════╗
║   🚀 Serveur API de Réplications          ║
╠════════════════════════════════════════════╣
║   URL: http://localhost:3000              ║
║   Env: development                        ║
║   Données: 2 réplications en mémoire      ║
╚════════════════════════════════════════════╝
```

### 2. Démarrer le frontend

Ouvrir un nouveau terminal PowerShell :

```powershell
npm run dev
```

### 3. Configurer le routeur (si nécessaire)

Si vous voulez tester la version REST séparément, vérifiez que le routeur inclut la route :

```typescript
// src/router/index.ts
{
  path: '/reporting-rest',
  name: 'ReportingRest',
  component: () => import('@/views/reporting/reportComponentRest.vue')
}
```

### 4. Accéder à l'application

Ouvrez votre navigateur : **http://localhost:5173**

## 🧪 Tests à effectuer

### Test 1 : Chargement initial ✅
- [ ] Les données s'affichent au démarrage
- [ ] La hiérarchie Boîte > App > DB > Schema > Réplication fonctionne

### Test 2 : Lazy loading (fonction `load`) ✅
- [ ] Cliquer sur une boîte applicative charge les applications
- [ ] Cliquer sur une application charge les bases de données
- [ ] Cliquer sur une base charge les schémas
- [ ] Cliquer sur un schéma charge les réplications
- [ ] Console affiche les logs : `initData typeSearch : CODEBOITE`, `APP`, etc.

### Test 3 : CRUD operations
- [ ] **Créer** : Ajouter une nouvelle réplication
- [ ] **Lire** : Afficher les détails d'une réplication
- [ ] **Modifier** : Changer le support conceptuel ou le type de client
- [ ] **Supprimer** : Supprimer une réplication INACTIVE

### Test 4 : Duplication
- [ ] Dupliquer une réplication (feuille)
- [ ] Dupliquer une application (avec enfants)
- [ ] Le label personnalisable fonctionne
- [ ] Les données sont rechargées depuis le serveur

### Test 5 : Export/Import
- [ ] Exporter génère un fichier JSON
- [ ] Importer un fichier JSON fonctionne
- [ ] Les données sont persistées sur le serveur

### Test 6 : Changement de statut
- [ ] Créer une demande de changement de statut
- [ ] Le commentaire est obligatoire
- [ ] Le nouveau statut est appliqué

## 🐛 Debugging

### Console navigateur (F12)

Vérifiez les logs suivants :

```javascript
// Chargement initial
"initData typeSearch : CODEBOITE"
"Expanded row: ReportBoite {...}"
"Loading children for row: ReportBoite {...}"

// Lazy loading
"initData typeSearch : APP"
"initData typeSearch : DB"
"initData typeSearch : SCHEMA"
```

### Console serveur

Vous devriez voir :

```
📊 GET /api/reports - 2 résultats trouvés
🔍 GET /api/replications/1/status
✅ POST /api/replications - ID: 3
✏️ PUT /api/replications/1
🗑️ DELETE /api/replications/2
📋 Duplication réussie - Nouveau ID: 4
```

## ❌ Erreurs courantes

### Erreur : `Cannot read property 'findReports' of undefined`

**Cause** : L'API REST n'est pas correctement importée

**Solution** :
```typescript
// Vérifier dans reportComponentRest.vue
import api from '@/api/replicationRestApi'  // ✅ Correct
// PAS
import api from '@/api/reportTestApi'  // ❌ Incorrect
```

### Erreur : `net::ERR_CONNECTION_REFUSED`

**Cause** : Le serveur backend n'est pas démarré

**Solution** :
```powershell
cd server
npm run dev
```

### Erreur : `load` ne charge pas les enfants

**Cause** : Utilisation de `ReportModel.ts` au lieu de `ReportModelRest.ts`

**Solution** :
```typescript
// Dans reportComponentRest.vue
import { ReportBoite, ... } from './ReportModelRest'  // ✅ Correct
```

### Erreur : `exportData is not a function`

**Cause** : La méthode n'est pas exportée dans l'API

**Solution** : Déjà corrigé ! Vérifier que `replicationRestApi.ts` exporte bien :
```typescript
replicationApi: {
  // ...
  exportData: (criteria) => replicationRestApi.exportData(criteria),
  importData: (file) => replicationRestApi.importData(file)
}
```

## 📊 Comparaison des fichiers

| Fichier | Version Mock | Version REST |
|---------|-------------|-------------|
| ReportModel | `ReportModel.ts` | `ReportModelRest.ts` |
| API Import | `reportTestApi` | `replicationRestApi` |
| Méthode initData | `.then().catch()` | `async/await` |
| Persistance | ❌ Mémoire volatile | ✅ Serveur REST |

## 🎯 Prochaines étapes

Une fois que tout fonctionne :

1. **Remplacer la version Mock** :
   ```bash
   # Sauvegarder l'ancienne version
   mv src/views/reporting/ReportModel.ts src/views/reporting/ReportModelMock.ts
   
   # Activer la version REST
   mv src/views/reporting/ReportModelRest.ts src/views/reporting/ReportModel.ts
   ```

2. **Mettre à jour le composant principal** :
   ```bash
   mv src/views/reporting/reportComponent.vue src/views/reporting/reportComponentMock.vue
   mv src/views/reporting/reportComponentRest.vue src/views/reporting/reportComponent.vue
   ```

3. **Nettoyer les imports** :
   ```typescript
   // Retour aux imports standards
   import { ReportBoite, ... } from './ReportModel'
   import api from '@/api/replicationRestApi'
   ```

## 📚 Documentation complète

- **REST-API-GUIDE.md** : Documentation de l'API REST
- **MIGRATION-GUIDE.md** : Guide de migration Mock → REST
- **README-REST.md** : Vue d'ensemble de l'architecture

---

**Note** : Cette version utilise un serveur REST avec base de données en mémoire. Pour une persistance réelle, consultez la section PostgreSQL dans **REST-API-GUIDE.md**.
