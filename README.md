# Application de Suivi des Réplications

Application Vue.js 3 pour le suivi et la gestion des réplications de bases de données avec interface hiérarchique.

## 🚀 Technologies

- **Vue.js 3.5.8** - Framework JavaScript avec Composition API
- **Element Plus 2.8.4** - Bibliothèque de composants UI
- **Pinia 2.1.7** - Gestion d'état
- **Vue Router 4.2.5** - Routage
- **TypeScript 5.3.0** - Typage statique
- **Vite 5.0** - Outil de build

## 📦 Installation

```bash
npm install
```

## 🏃 Démarrage

```bash
npm run dev
```

## 📋 Fonctionnalités

### 🌳 Arborescence Hiérarchique

L'application affiche les réplications dans une structure hiérarchique à 5 niveaux :

1. **Code Boîte** - Boîte applicative (code boîte)
2. **Application** - Application dans la boîte
3. **Base de données** - Base de données avec type de support
4. **Schéma** - Schéma de base de données
5. **Réplication** - Réplication source ou cible

#### Chargement Progressif (Lazy Loading)

- Les données ne sont pas chargées en une seule fois
- Chaque niveau se charge uniquement lorsqu'on déplie un élément
- Améliore les performances avec de grandes quantités de données
- Réduit la charge réseau initiale

### 🔍 Recherche

Barre de recherche permettant de filtrer les réplications selon plusieurs critères :
- Code boîte
- Application
- Base de données
- Schéma
- Type de support

### 📤 Export de Données

#### Vue d'ensemble
L'export permet de sauvegarder l'intégralité de la structure hiérarchique affichée dans un fichier JSON. Cette fonctionnalité préserve tous les niveaux de l'arborescence ainsi que les relations parent-enfant.

#### Comment utiliser
1. **Préparer les données** : Utilisez la barre de recherche pour filtrer les données si nécessaire
2. **Cliquer sur "Exporter"** : Bouton bleu en haut à droite de la page
3. **Téléchargement automatique** : Le fichier `replications-export-YYYY-MM-DD.json` est généré
4. **Confirmation** : Une notification confirme le succès de l'export

#### Algorithme d'export (récursif)

```typescript
function serializeReport(report: ReportModel): any {
  const serialized = {
    id: report.id,                           // Identifiant unique
    label: report.label,                     // Label affiché
    statuses: report.statuses,               // Statuts (ACTIVE, INACTIVE, etc.)
    count: report.count,                     // Nombre d'éléments
    replication: report.report?.replication, // Données métier
    clientTypes: report.report?.clientTypes, // Types de client
    hasChildren: report.hasChildren          // Indicateur d'enfants
  }

  // Récursion : parcourir tous les enfants
  if (report.children && report.children.length > 0) {
    serialized.children = report.children.map(child => serializeReport(child))
  }

  return serialized
}
```

#### Structure du fichier JSON

```json
{
  "timestamp": "2025-11-17T10:30:00.000Z",
  "criteria": {
    "codeBoite": "AAAA",
    "app": "Base A",
    "db": "V01DBA",
    "schema": "cardvirtrplsource"
  },
  "reports": [
    {
      "id": "AAAA",
      "label": "AAAA - Base A",
      "statuses": ["ACTIVE"],
      "count": 5,
      "hasChildren": true,
      "replication": {
        "boite": "AAAA",
        "id": 1
      },
      "children": [
        {
          "id": "AAAA/cardvirtrplsource",
          "label": "cardvirtrplsource",
          "statuses": ["ACTIVE"],
          "count": 3,
          "hasChildren": true,
          "replication": {
            "boite": "AAAA",
            "app": "cardvirtrplsource",
            "id": 2
          },
          "children": [
            {
              "id": "AAAA/cardvirtrplsource/V01DBA/POSTGRESQL",
              "label": "V01DBA/POSTGRESQL",
              "statuses": ["ACTIVE"],
              "count": 2,
              "hasChildren": true,
              "replication": {
                "boite": "AAAA",
                "app": "cardvirtrplsource",
                "database": "V01DBA",
                "supportType": "POSTGRESQL",
                "id": 3
              },
              "children": [
                {
                  "id": "AAAA/cardvirtrplsource/V01DBA/POSTGRESQL/public",
                  "label": "public",
                  "statuses": ["ACTIVE"],
                  "count": 2,
                  "hasChildren": true,
                  "replication": {
                    "boite": "AAAA",
                    "app": "cardvirtrplsource",
                    "database": "V01DBA",
                    "supportType": "POSTGRESQL",
                    "schema": "public",
                    "id": 4
                  },
                  "children": [
                    {
                      "id": "101",
                      "label": "T05CARV",
                      "statuses": ["ACTIVE"],
                      "count": 0,
                      "hasChildren": false,
                      "replication": {
                        "id": 101,
                        "boite": "AAAA",
                        "app": "cardvirtrplsource",
                        "database": "V01DBA",
                        "supportType": "POSTGRESQL",
                        "schema": "public",
                        "supportConceptuel": "T05CARV",
                        "clientType": "SOURCE"
                      }
                    },
                    {
                      "id": "102",
                      "label": "T05PARV",
                      "statuses": ["ACTIVE"],
                      "count": 0,
                      "hasChildren": false,
                      "replication": {
                        "id": 102,
                        "boite": "AAAA",
                        "app": "cardvirtrplsource",
                        "database": "V01DBA",
                        "supportType": "POSTGRESQL",
                        "schema": "public",
                        "supportConceptuel": "T05PARV",
                        "clientType": "SOURCE"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### Cas d'usage

**1. Sauvegarde avant modifications**
```bash
# Exporter avant de faire des changements importants
1. Export → replications-export-2025-11-17.json
2. Effectuer les modifications
3. Si problème → Importer le fichier sauvegardé
```

**2. Partage de données entre environnements**
```bash
# Environnement de développement
Export → replications-dev-export.json

# Environnement de test
Import ← replications-dev-export.json
```

**3. Documentation et audit**
```bash
# Garder un historique mensuel
replications-export-2025-01-01.json
replications-export-2025-02-01.json
replications-export-2025-03-01.json
```

**4. Analyse des données**
```python
import json

with open('replications-export-2025-11-17.json', 'r') as f:
    data = json.load(f)
    
# Analyser les statuts
statuses = {}
for report in data['reports']:
    for status in report['statuses']:
        statuses[status] = statuses.get(status, 0) + 1
```

#### Avantages
- ✅ **Sauvegarde complète** : Toute la hiérarchie est préservée
- ✅ **Format lisible** : JSON formaté avec indentation (2 espaces)
- ✅ **Portabilité** : Fonctionne entre différentes instances
- ✅ **Versioning** : Date dans le nom de fichier
- ✅ **Critères préservés** : Les filtres de recherche sont inclus
- ✅ **Pas de perte de données** : Toutes les métadonnées sont exportées

#### Limitations
- ⚠️ Les enfants non chargés (lazy loading) ne sont pas exportés
- ⚠️ Seules les données visibles/chargées sont incluses
- ⚠️ Taille du fichier peut être importante pour de grandes arborescences

### 📥 Import de Données

#### Vue d'ensemble
L'import reconstruit une hiérarchie complète à partir d'un fichier JSON exporté précédemment. Le système utilise un algorithme récursif intelligent qui détecte automatiquement le niveau de chaque élément et instancie les bonnes classes TypeScript.

#### Comment utiliser
1. **Cliquer sur "Importer"** : Bouton vert en haut à droite
2. **Sélectionner le fichier** : Dialogue de sélection de fichier s'ouvre
3. **Chargement automatique** : Le système lit et reconstruit l'arborescence
4. **Confirmation** : Notification avec le nombre d'éléments importés
5. **Visualisation** : Les données apparaissent dans la table avec possibilité de déplier

#### Algorithme de reconstruction (récursif)

```typescript
function reconstructReport(reportData: any, level: string = 'CODEBOITE'): ReportModel | null {
  // 1. Validation : vérifier que replication existe
  if (!reportData.replication) {
    return null
  }

  // 2. Créer un objet NodeReportDto complet
  const nodeReport = {
    replication: reportData.replication,
    statuses: reportData.statuses || [],
    clientTypes: reportData.clientTypes,
    clientType: reportData.replication?.clientType,
    count: reportData.count
  }

  // 3. Déterminer la classe à instancier selon le niveau
  let report: ReportModel
  
  if (reportData.hasChildren === false || level === 'REPLICATION') {
    // Feuille de l'arbre : ReplicationStatusReportModel
    report = new ReplicationStatusReportModel(nodeReport, criteria, keyStore.key++)
  } else {
    // Nœud intermédiaire : instancier selon le niveau
    switch (level) {
      case 'CODEBOITE':
        report = new ReportBoite(nodeReport, criteria, keyStore.key++)
        break
      case 'APP':
        report = new ReportApp(nodeReport, criteria, keyStore.key++)
        break
      case 'DB':
        report = new ReportDb(nodeReport, criteria, keyStore.key++)
        break
      case 'SCHEMA':
        report = new ReportSchema(nodeReport, criteria, keyStore.key++)
        break
      default:
        report = new ReportBoite(nodeReport, criteria, keyStore.key++)
    }
  }

  // 4. Reconstruction récursive des enfants
  if (reportData.children && Array.isArray(reportData.children) && reportData.children.length > 0) {
    report.children = []
    
    // Déterminer le niveau suivant
    const nextLevel = 
      level === 'CODEBOITE' ? 'APP' :
      level === 'APP' ? 'DB' :
      level === 'DB' ? 'SCHEMA' :
      level === 'SCHEMA' ? 'REPLICATION' : 'REPLICATION'

    // Récursion : traiter chaque enfant
    reportData.children.forEach((childData: any) => {
      const childReport = reconstructReport(childData, nextLevel)
      if (childReport) {
        report.children.push(childReport)
      }
    })
    
    report.hasChildren = true
    report.open = true  // Pré-ouvrir les nœuds avec enfants
  }

  return report
}
```

#### Détection de niveau

Le système utilise une machine à états pour déterminer le niveau :

```
CODEBOITE (Niveau 1)
    ↓
   APP (Niveau 2)
    ↓
   DB (Niveau 3)
    ↓
  SCHEMA (Niveau 4)
    ↓
REPLICATION (Niveau 5 - feuille)
```

**Critères de détection** :
- `hasChildren === false` → Réplication (feuille)
- Niveau transmis en paramètre → Instanciation correcte
- Chaque niveau crée ses enfants au niveau suivant

#### Processus complet

```typescript
// 1. Lecture du fichier
const reader = new FileReader()
reader.readAsText(file.raw)

// 2. Parsing JSON
const importedData = JSON.parse(content)

// 3. Validation
if (!importedData.reports || !Array.isArray(importedData.reports)) {
  throw new Error('Format de fichier invalide')
}

// 4. Restauration des critères
if (importedData.criteria) {
  infoSearch.value = importedData.criteria
}

// 5. Reconstruction récursive
boiteReports.value = []
importedData.reports.forEach((reportData: any) => {
  const report = reconstructReport(reportData)
  if (report) {
    boiteReports.value.push(report)
  }
})
```

#### Gestion des clés uniques

Chaque élément importé reçoit une nouvelle clé unique via `keyStore.key++` :

```typescript
// Avant import
Original: key=1, key=2, key=3

// Après import (nouvelles clés)
Importé: key=4, key=5, key=6

// Permet d'avoir original + importé sans conflit
```

#### Classes instanciées par niveau

| Niveau | Classe | Propriétés spécifiques |
|--------|--------|------------------------|
| 1 | `ReportBoite` | `boite`, `libelle` ajouté depuis store |
| 2 | `ReportApp` | `app` |
| 3 | `ReportDb` | `database`, `supportType` |
| 4 | `ReportSchema` | `schema` |
| 5 | `ReplicationStatusReportModel` | `supportConceptuel`, `clientType`, `iconeReplType` |

#### Exemple de reconstruction

**Fichier JSON** :
```json
{
  "id": "AAAA",
  "label": "AAAA - Base A",
  "children": [
    {
      "id": "AAAA/app1",
      "label": "app1",
      "children": [...]
    }
  ]
}
```

**Résultat TypeScript** :
```typescript
ReportBoite {
  key: 4,
  id: "AAAA",
  label: "AAAA - Base A",
  iconeurl: "icon-code-boite",
  hasChildren: true,
  children: [
    ReportApp {
      key: 5,
      id: "AAAA/app1",
      label: "app1",
      iconeurl: "icon-application",
      hasChildren: true,
      children: [...]
    }
  ]
}
```

#### Cas d'usage

**1. Restauration après erreur**
```bash
1. Problème détecté dans les données
2. Import du dernier export valide
3. Données restaurées à l'état précédent
```

**2. Migration de données**
```bash
# Serveur A
Export → replications.json

# Transfert fichier vers Serveur B

# Serveur B
Import ← replications.json
```

**3. Tests et développement**
```bash
# Créer un jeu de données de test
1. Configurer manuellement des données
2. Exporter → test-data.json
3. Réimporter quand nécessaire pour les tests
```

**4. Copie d'environnement**
```bash
Production → Export → production-backup.json
              ↓
          Dev/Test Import ← Environnement identique
```

#### Validation et gestion des erreurs

**Validations effectuées** :
```typescript
// 1. Format JSON valide
JSON.parse(content)  // Lève une exception si invalide

// 2. Structure attendue
if (!importedData.reports || !Array.isArray(importedData.reports)) {
  throw new Error('Format de fichier invalide')
}

// 3. Chaque élément a une réplication
if (!reportData.replication) {
  return null  // Skip l'élément
}

// 4. Les enfants sont un tableau
if (reportData.children && Array.isArray(reportData.children))
```

**Messages d'erreur** :
- ❌ "Format de fichier invalide" → Structure JSON incorrecte
- ❌ "Impossible d'importer le fichier. Vérifiez le format." → Erreur de parsing
- ❌ "Erreur de lecture du fichier" → Problème avec FileReader
- ✅ "X réplication(s) importée(s) avec leurs hiérarchies" → Succès

#### Avantages
- ✅ **Intelligence** : Détection automatique des niveaux
- ✅ **Robustesse** : Validation multi-niveaux
- ✅ **Préservation** : Toute la structure est recréée à l'identique
- ✅ **Clés uniques** : Pas de conflit avec données existantes
- ✅ **Typage fort** : Classes TypeScript correctement instanciées
- ✅ **Critères restaurés** : Filtres de recherche réappliqués
- ✅ **État pré-ouvert** : Nœuds avec enfants automatiquement dépliés

#### Limitations et précautions
- ⚠️ **Écrase les données actuelles** : `boiteReports.value = []` vide la table
- ⚠️ **Format strict** : Le fichier doit provenir d'un export valide
- ⚠️ **Pas de fusion** : Import remplace, ne fusionne pas
- ⚠️ **Nouvelles clés** : Les clés originales ne sont pas préservées
- 💡 **Solution** : Toujours exporter avant d'importer si données importantes

### 🎯 Actions sur les Réplications

#### 🔄 Duplication

##### Vue d'ensemble
La duplication crée une copie complète et indépendante d'un élément avec toute sa descendance. Le système utilise un algorithme récursif de copie profonde pour garantir qu'aucune référence n'est partagée entre l'original et la copie.

##### Comment utiliser
1. **Identifier l'élément** : Trouver l'élément à dupliquer (doit avoir `hasChildren = true`)
2. **Cliquer sur le bouton violet "Dupliquer"** : Icône DocumentCopy
3. **Confirmer** : Boîte de dialogue "Voulez-vous dupliquer cet élément et tous ses enfants ?"
4. **Visualisation** : La copie apparaît immédiatement après l'original avec " (copie)" dans le label
5. **Vérification** : Déplier pour voir que tous les enfants ont été copiés

##### Algorithme de duplication (récursif)

```typescript
function duplicateReport(original: ReportModel): ReportModel {
  // 1. COPIE PROFONDE de l'objet report (évite les références partagées)
  const reportCopy = JSON.parse(JSON.stringify(original.report))
  
  // 2. INSTANCIATION de la bonne classe selon le type
  let duplicated: ReportModel
  
  if (original instanceof ReplicationStatusReportModel) {
    duplicated = new ReplicationStatusReportModel(
      reportCopy,
      infoSearch.value,
      keyStore.key++  // Nouvelle clé unique
    )
  } else if (original instanceof ReportSchema) {
    duplicated = new ReportSchema(reportCopy, infoSearch.value, keyStore.key++)
  } else if (original instanceof ReportDb) {
    duplicated = new ReportDb(reportCopy, infoSearch.value, keyStore.key++)
  } else if (original instanceof ReportApp) {
    duplicated = new ReportApp(reportCopy, infoSearch.value, keyStore.key++)
  } else if (original instanceof ReportBoite) {
    duplicated = new ReportBoite(reportCopy, infoSearch.value, keyStore.key++)
  }
  
  // 3. MODIFIER le label pour distinguer la copie
  duplicated.label = `${original.label} (copie)`
  
  // 4. COPIER les propriétés sans références partagées
  duplicated.statuses = original.statuses ? [...original.statuses] : []
  duplicated.count = original.count
  
  // 5. DUPLICATION RÉCURSIVE des enfants
  if (original.children && original.children.length > 0) {
    duplicated.children = original.children.map(child => duplicateReport(child))
    duplicated.hasChildren = true
    duplicated.open = true  // Pré-ouvrir pour visualiser
  } else {
    duplicated.children = []
  }
  
  return duplicated
}
```

##### Insertion intelligente

La copie est insérée au même niveau que l'original, juste après :

```typescript
function findAndInsert(items: ReportModel[]): boolean {
  for (let i = 0; i < items.length; i++) {
    // Recherche de l'élément original
    if (items[i].key === rplToDuplicate.value.key) {
      // Insertion à la position i+1
      items.splice(i + 1, 0, duplicatedReport)
      return true
    }
    
    // Recherche récursive dans les enfants
    if (items[i].children && items[i].children.length > 0) {
      if (findAndInsert(items[i].children)) {
        return true
      }
    }
  }
  return false
}

// Lancement de la recherche
findAndInsert(boiteReports.value)

// Forcer le re-render de Vue
boiteReports.value = [...boiteReports.value]
```

##### Exemples détaillés

**Exemple 1 : Duplication d'une base de données**

Avant :
```
AAAA - Base A
├── cardvirtrplsource
│   ├── V01DBA/POSTGRESQL
│   │   ├── public
│   │   │   ├── T05CARV (id: 101, status: ACTIVE)
│   │   │   └── T05PARV (id: 102, status: ACTIVE)
│   └── V02DBA/MYSQL
```

Dupliquer `V01DBA/POSTGRESQL` :

Après :
```
AAAA - Base A
├── cardvirtrplsource
│   ├── V01DBA/POSTGRESQL              (original, key: 3)
│   │   ├── public                     (original, key: 4)
│   │   │   ├── T05CARV               (original, key: 101)
│   │   │   └── T05PARV               (original, key: 102)
│   ├── V01DBA/POSTGRESQL (copie)      (nouveau, key: 5)
│   │   ├── public (copie)             (nouveau, key: 6)
│   │   │   ├── T05CARV (copie)       (nouveau, key: 103)
│   │   │   └── T05PARV (copie)       (nouveau, key: 104)
│   └── V02DBA/MYSQL
```

**Exemple 2 : Duplication d'un schéma**

Avant :
```
BBBB - Base B
├── app2
│   ├── DBPROD/ORACLE
│   │   ├── HR_SCHEMA
│   │   │   ├── EMPLOYEES (id: 201, clientType: SOURCE)
│   │   │   ├── DEPARTMENTS (id: 202, clientType: SOURCE)
│   │   │   └── SALARIES (id: 203, clientType: CIBLE)
│   │   └── FINANCE_SCHEMA
```

Dupliquer `HR_SCHEMA` :

Après :
```
BBBB - Base B
├── app2
│   ├── DBPROD/ORACLE
│   │   ├── HR_SCHEMA                          (original)
│   │   │   ├── EMPLOYEES                      (original, SOURCE)
│   │   │   ├── DEPARTMENTS                    (original, SOURCE)
│   │   │   └── SALARIES                       (original, CIBLE)
│   │   ├── HR_SCHEMA (copie)                  (nouveau)
│   │   │   ├── EMPLOYEES (copie)              (nouveau, SOURCE)
│   │   │   ├── DEPARTMENTS (copie)            (nouveau, SOURCE)
│   │   │   └── SALARIES (copie)               (nouveau, CIBLE)
│   │   └── FINANCE_SCHEMA
```

##### Copie profonde vs Copie superficielle

**❌ Copie superficielle (mauvaise approche)** :
```typescript
// PROBLÈME : Références partagées
const duplicated = original
duplicated.label = original.label + " (copie)"
duplicated.children = original.children  // ⚠️ MÊME RÉFÉRENCE !

// Résultat : Modifier la copie modifie aussi l'original
duplicated.children[0].label = "Modifié"
// → original.children[0].label est aussi "Modifié" !
```

**✅ Copie profonde (bonne approche)** :
```typescript
// SOLUTION : Nouvelles instances complètement indépendantes
const reportCopy = JSON.parse(JSON.stringify(original.report))
const duplicated = new ReportDb(reportCopy, criteria, newKey)
duplicated.statuses = [...original.statuses]  // Nouveau tableau
duplicated.children = original.children.map(child => duplicateReport(child))

// Résultat : Copie et original totalement indépendants
duplicated.children[0].label = "Modifié"
// → original.children[0].label reste inchangé ✓
```

##### Gestion des types TypeScript

Chaque niveau crée une instance de la bonne classe :

```typescript
// Vérification du type avec instanceof
if (original instanceof ReplicationStatusReportModel) {
  // Crée une nouvelle ReplicationStatusReportModel
  duplicated = new ReplicationStatusReportModel(...)
  // Propriétés spécifiques : clientType, iconeReplType
}

if (original instanceof ReportDb) {
  // Crée une nouvelle ReportDb
  duplicated = new ReportDb(...)
  // Propriétés spécifiques : database, supportType
}
```

##### Génération de clés uniques

```typescript
// KeyStore gère un compteur global
class KeyStore {
  key = 1000
}

// Avant duplication
Original:
  ReportBoite (key: 1)
  ├── ReportApp (key: 2)
      ├── ReportDb (key: 3)

// Après duplication (keyStore.key++ pour chaque nouveau nœud)
Copie:
  ReportBoite (key: 1001)  ← key++ lors de la création
  ├── ReportApp (key: 1002)  ← key++ lors de la création
      ├── ReportDb (key: 1003)  ← key++ lors de la création
```

##### Cas d'usage pratiques

**1. Créer des variantes**
```bash
# Base de données de production
PROD_DB
├── public
    ├── users
    └── orders

# Dupliquer pour créer environnement de test
PROD_DB
├── public
    ├── users
    └── orders
PROD_DB (copie)  ← Renommer en "TEST_DB"
├── public (copie)
    ├── users (copie)
    └── orders (copie)
```

**2. Répliquer des configurations**
```bash
# Configuration Application A
APP_A
├── DB_CONFIG
    ├── schema1
    └── schema2

# Dupliquer pour Application B (même structure)
APP_A
├── DB_CONFIG
    ├── schema1
    └── schema2
APP_A (copie)  ← Base pour APP_B
├── DB_CONFIG (copie)
    ├── schema1 (copie)
    └── schema2 (copie)
```

**3. Sauvegardes avant modifications**
```bash
# Avant modification importante
1. Dupliquer l'élément
2. Modifier l'original
3. Si problème : Supprimer l'original, renommer la copie
```

**4. Créer des templates**
```bash
# Template standard
TEMPLATE_DB
├── common_schema
    ├── config_table
    └── log_table

# Dupliquer pour chaque nouveau projet
TEMPLATE_DB (copie) → PROJECT_A_DB
TEMPLATE_DB (copie) → PROJECT_B_DB
TEMPLATE_DB (copie) → PROJECT_C_DB
```

##### Propriétés copiées

| Propriété | Type | Copie |
|-----------|------|-------|
| `id` | string | ✅ Copié |
| `key` | number | ✅ **NOUVEAU** (unique) |
| `label` | string | ✅ Copié + " (copie)" |
| `statuses` | string[] | ✅ Nouveau tableau |
| `count` | number | ✅ Copié |
| `hasChildren` | boolean | ✅ Copié |
| `children` | ReportModel[] | ✅ Duplication récursive |
| `report.replication` | object | ✅ Copie profonde (JSON) |
| `iconeurl` | string | ✅ Régénéré par constructeur |
| `titleIcone` | string | ✅ Régénéré par constructeur |

##### Forçage du re-render Vue

```typescript
// Problème : Element Plus Table ne détecte pas les modifications internes
items.splice(i + 1, 0, duplicatedReport)  // Modification interne du tableau

// Solution : Créer une nouvelle référence de tableau
boiteReports.value = [...boiteReports.value]  // Spread operator
// Vue détecte le changement et re-render la table
```

##### Avantages
- ✅ **Indépendance totale** : Aucune référence partagée
- ✅ **Récursion illimitée** : Supporte n'importe quelle profondeur
- ✅ **Type-safe** : Instances TypeScript correctes
- ✅ **Clés uniques garanties** : Pas de conflit
- ✅ **Position logique** : Juste après l'original
- ✅ **Visualisation immédiate** : Nœuds pré-ouverts
- ✅ **Confirmation utilisateur** : Évite les duplications accidentelles
- ✅ **Feedback visuel** : Label " (copie)" + notification

##### Limitations et précautions
- ⚠️ **Disponibilité** : Seulement si `hasChildren = true`
- ⚠️ **Pas de fusion** : Crée toujours une nouvelle branche
- ⚠️ **IDs non modifiés** : Les IDs de réplication sont copiés (attention en production)
- ⚠️ **Taille mémoire** : Duplication de grandes arborescences = impact mémoire
- 💡 **Solution IDs** : Après duplication, modifier manuellement les IDs si nécessaire
- 💡 **Performance** : Pour grandes structures, préférer export/import

#### ❌ Suppression

- Supprimer une réplication inactive
- Confirmation requise
- Permissions : Admin (900) ou Manager (200+)

#### ✏️ Modification

- Modifier les paramètres d'une réplication
- Permissions : Admin (900) ou Manager (200+)

#### ➕ Ajout

- Ajouter une nouvelle réplication
- Uniquement pour les réplications source
- Permissions : Admin (900) ou Manager (200+)

#### 📊 Historique

- Consulter l'historique des statuts
- Disponible pour toutes les réplications
- Permission minimale : Visualisation (100)

#### 📝 Demande de Changement

- Créer une demande de changement de statut
- Permissions : Admin (900) ou Manager (200+)

### 🔐 Système de Permissions

Trois niveaux d'habilitation :
- **100** - Visualisation : Consulter et voir l'historique
- **200+** - Gestion : Modifier, ajouter, créer des demandes
- **900** - Administration : Tous les droits

### 🎨 Icônes Personnalisées

Interface avec icônes CSS personnalisées :
- 📦 **Code Boîte** - Carré bleu avec cadre blanc
- 📱 **Application** - Gradient bleu avec pastille blanche
- 🗄️ **Base de données** - Rectangle bleu avec "DB"
- 📋 **Schéma** - Rectangle bleu clair avec ligne
- 🔄 **Réplication** - Cercle bleu avec symbole rotation
- ➡️ **Source** - Carré vert avec flèche droite
- ⬅️ **Cible** - Carré orange avec flèche gauche

### 📊 Statuts

Affichage des statuts pour chaque niveau :
- **ACTIVE** - Vert
- **INACTIVE** - Gris
- **ERROR** - Rouge
- **PENDING** - Orange

## 🏗️ Architecture

### Structure des Fichiers

```
src/
├── views/
│   └── reporting/
│       ├── reportComponent.vue    # Composant principal
│       └── ReportModel.ts         # Modèles de données
├── components/
│   ├── reportButton.vue           # Bouton d'action réutilisable
│   ├── spaceButton.vue            # Espace réservé
│   ├── SearchBar.vue              # Barre de recherche
│   └── StatusesComponent.vue      # Affichage des statuts
├── api/
│   ├── reportTestApi.ts           # API Mock
│   └── contract/
│       └── data-contracts.ts      # Types TypeScript
└── stores/
    ├── useCodeBoiteStore.ts       # Store des permissions
    └── useKeyStore.ts             # Générateur de clés
```

### Modèles de Données

#### Classes Hiérarchiques

```typescript
ReportAbstract (classe de base)
├── ReportBoite          // Niveau 1
├── ReportApp            // Niveau 2
├── ReportDb             // Niveau 3
├── ReportSchema         // Niveau 4
└── ReplicationStatusReportModel  // Niveau 5 (feuille)
```

Chaque classe implémente :
- `load()` - Chargement lazy des enfants
- `applyReport()` - Application des données
- `initCriteria()` - Initialisation des critères de recherche

### API Mock

L'API Mock (`reportTestApi.ts`) simule un backend réel :
- Filtrage par critères multiples
- Réponses par niveau hiérarchique
- Simulation de latence réseau
- Structure de données réaliste

## 🎨 Personnalisation des Boutons

### Bouton Personnalisé

Le composant `reportButton.vue` accepte une propriété `custom-class` pour un style personnalisé :

```vue
<reportButton
  custom-class="btn-purple"
  title-btn="Mon action"
  type-btn="primary"
  icon-btn="Plus"
  @click="maFonction"
/>
```

**Style violet du bouton Dupliquer** :
```css
.btn-purple {
  background-color: #9333ea !important;
  border-color: #9333ea !important;
  color: white !important;
}

.btn-purple:hover {
  background-color: #7e22ce !important;
  border-color: #7e22ce !important;
}
```

## 🔧 Configuration

### Stores Pinia

#### useCodeBoiteStore
- Gestion des permissions (habilitation)
- Liste des boîtes autorisées
- Informations utilisateur

#### useKeyStore
- Génération de clés uniques
- Incrémentation automatique
- Utilisé pour l'attribut `row-key` d'Element Plus

### Variables d'Environnement

Configuration des URLs d'API dans `.env` :
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📚 Bonnes Pratiques

### Gestion de l'État

- Utilisation de refs pour la réactivité
- Copie profonde lors de la duplication (`JSON.parse(JSON.stringify())`)
- Nouvelles références pour forcer le re-render (`[...array]`)

### Performances

- Lazy loading systématique
- Chargement à la demande
- Cache des résultats de recherche
- Réutilisation des composants

### TypeScript

- Typage strict de toutes les fonctions
- Interfaces pour les modèles
- Type guards avec `instanceof`
- Gestion explicite des valeurs undefined/null

## 🐛 Dépannage

### Les enfants ne s'affichent pas après duplication
**Solution** : La table Element Plus nécessite une nouvelle référence de tableau
```typescript
boiteReports.value = [...boiteReports.value]
```

### Références partagées entre original et copie
**Solution** : Utiliser `JSON.parse(JSON.stringify())` pour une copie profonde
```typescript
const reportCopy = JSON.parse(JSON.stringify(original.report))
```

### Clés en double dans la table
**Solution** : Utiliser le KeyStore pour générer des clés uniques
```typescript
keyStore.key++
```

## 📝 Licence

ISC

## 👥 Contributeurs

Développé avec Vue.js 3 et Element Plus
