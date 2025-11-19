const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Configuration de multer pour l'upload de fichiers
const upload = multer({ dest: 'uploads/' })

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Base de données en mémoire (remplacer par PostgreSQL en production)
let replications = [
  // Boîte AAAA - Application cardvirtrplsource
  {
    replication: {
      id: 1,
      boite: 'AAAA',
      app: 'cardvirtrplsource',
      database: 'V01DBA',
      supportType: 'POSTGRESQL',
      schema: 'public',
      supportConceptuel: 'T05CARV',
      clientType: 'SOURCE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['SOURCE'],
    count: 5
  },
  {
    replication: {
      id: 2,
      boite: 'AAAA',
      app: 'cardvirtrplsource',
      database: 'V01DBA',
      supportType: 'POSTGRESQL',
      schema: 'schema2',
      supportConceptuel: 'T06CARV',
      clientType: 'SOURCE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['SOURCE'],
    count: 3
  },
  // Boîte AAAA - Application cardvirtrplcible
  {
    replication: {
      id: 3,
      boite: 'AAAA',
      app: 'cardvirtrplcible',
      database: 'V01DBA',
      supportType: 'POSTGRESQL',
      schema: 'public',
      supportConceptuel: 'T05CARV_COPY',
      clientType: 'CIBLE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['CIBLE'],
    count: 3
  },
  {
    replication: {
      id: 4,
      boite: 'AAAA',
      app: 'cardvirtrplcible',
      database: 'V02DBA',
      supportType: 'MYSQL',
      schema: 'app_schema',
      supportConceptuel: 'T07CARV',
      clientType: 'CIBLE',
      createdAt: new Date().toISOString()
    },
    statuses: ['INACTIVE'],
    clientTypes: ['CIBLE'],
    count: 1
  },
  // Boîte BBBB - Application gestionStock
  {
    replication: {
      id: 5,
      boite: 'BBBB',
      app: 'gestionStock',
      database: 'STOCK_DB',
      supportType: 'ORACLE',
      schema: 'STK_SCHEMA',
      supportConceptuel: 'T10STK',
      clientType: 'SOURCE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['SOURCE'],
    count: 8
  },
  {
    replication: {
      id: 6,
      boite: 'BBBB',
      app: 'gestionStock',
      database: 'STOCK_DB',
      supportType: 'ORACLE',
      schema: 'STK_HISTORY',
      supportConceptuel: 'T11STK_HIST',
      clientType: 'SOURCE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['SOURCE'],
    count: 12
  },
  // Boîte BBBB - Application commandeClient
  {
    replication: {
      id: 7,
      boite: 'BBBB',
      app: 'commandeClient',
      database: 'CMD_DB',
      supportType: 'DB2MVS',
      schema: 'CMD_MAIN',
      supportConceptuel: 'T20CMD',
      clientType: 'SOURCE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['SOURCE'],
    count: 15
  },
  {
    replication: {
      id: 8,
      boite: 'BBBB',
      app: 'commandeClient',
      database: 'CMD_DB',
      supportType: 'DB2MVS',
      schema: 'CMD_ARCHIVE',
      supportConceptuel: 'T21CMD_ARCH',
      clientType: 'CIBLE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['CIBLE'],
    count: 6
  },
  // Boîte CCCC - Application facturation
  {
    replication: {
      id: 9,
      boite: 'CCCC',
      app: 'facturation',
      database: 'FACT_DB',
      supportType: 'SQLSERVER',
      schema: 'dbo',
      supportConceptuel: 'T30FACT',
      clientType: 'SOURCE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['SOURCE'],
    count: 20
  },
  {
    replication: {
      id: 10,
      boite: 'CCCC',
      app: 'facturation',
      database: 'FACT_DB',
      supportType: 'SQLSERVER',
      schema: 'reporting',
      supportConceptuel: 'T31FACT_RPT',
      clientType: 'CIBLE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['CIBLE'],
    count: 10
  },
  // Boîte DDDD - Application cardvirtrplsource (exemple de votre requête)
  {
    replication: {
      id: 11,
      boite: 'DDDD',
      app: 'cardvirtrplsource',
      database: 'LOCDV0O',
      supportType: 'DB2MVS',
      schema: 'VO1DBA',
      supportConceptuel: 'T40CARD_V01',
      clientType: 'SOURCE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['SOURCE'],
    count: 2
  },
  {
    replication: {
      id: 12,
      boite: 'DDDD',
      app: 'cardvirtrplsource',
      database: 'LOCDVOO',
      supportType: 'DB2MVS',
      schema: 'V03DBA',
      supportConceptuel: 'T41CARD_V03',
      clientType: 'SOURCE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['SOURCE'],
    count: 2
  },
  {
    replication: {
      id: 13,
      boite: 'DDDD',
      app: 'cardvirtrplsource',
      database: 'LOCDV0O',
      supportType: 'DB2MVS',
      schema: 'V02DBA',
      supportConceptuel: 'T42CARD_V02',
      clientType: 'SOURCE',
      createdAt: new Date().toISOString()
    },
    statuses: ['PENDING'],
    clientTypes: ['SOURCE'],
    count: 1
  },
  // Boîte DDDD - Application analyseData
  {
    replication: {
      id: 14,
      boite: 'DDDD',
      app: 'analyseData',
      database: 'ANALYTICS_DB',
      supportType: 'POSTGRESQL',
      schema: 'public',
      supportConceptuel: 'T50ANALYTICS',
      clientType: 'CIBLE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ACTIVE'],
    clientTypes: ['CIBLE'],
    count: 7
  },
  {
    replication: {
      id: 15,
      boite: 'DDDD',
      app: 'analyseData',
      database: 'ANALYTICS_DB',
      supportType: 'POSTGRESQL',
      schema: 'dwh',
      supportConceptuel: 'T51DWH',
      clientType: 'CIBLE',
      createdAt: new Date().toISOString()
    },
    statuses: ['ERROR'],
    clientTypes: ['CIBLE'],
    count: 0
  }
]

let statusHistory = {}
let nextId = 16

// ==================== ROUTES REPORTS ====================

/**
 * POST /api/reports
 * Récupère les rapports selon les critères
 * Retourne uniquement les champs nécessaires selon le niveau hiérarchique demandé
 * Regroupe les résultats identiques et agrège les compteurs
 */
app.post('/api/reports', (req, res) => {
  try {
    const { codeBoite, app, db, schema, support, typeSupport } = req.body
    
    let filtered = [...replications]
    
    // Filtrage selon les critères
    if (codeBoite) {
      filtered = filtered.filter(r => r.replication.boite === codeBoite)
    }
    if (app) {
      filtered = filtered.filter(r => 
        r.replication.app.toLowerCase().includes(app.toLowerCase())
      )
    }
    if (db) {
      filtered = filtered.filter(r => r.replication.database === db)
    }
    if (schema) {
      filtered = filtered.filter(r => r.replication.schema === schema)
    }
    if (support) {
      filtered = filtered.filter(r => 
        r.replication.supportConceptuel.toLowerCase().includes(support.toLowerCase())
      )
    }
    if (typeSupport) {
      filtered = filtered.filter(r => r.replication.supportType === typeSupport)
    }
    
    // Déterminer le niveau hiérarchique et créer une clé de regroupement
    const groupByKey = (item) => {
      // Niveau 0: ROOT (aucun critère - regrouper par boite uniquement)
      if (!codeBoite && !app && !db && !schema) {
        return item.replication.boite
      }
      // Niveau 1: CODEBOITE (regrouper par boite + app)
      else if (codeBoite && !app && !db && !schema) {
        return `${item.replication.boite}|${item.replication.app}`
      }
      // Niveau 2: APP (regrouper par boite + app + database + supportType)
      else if (codeBoite && app && !db && !schema) {
        return `${item.replication.boite}|${item.replication.app}|${item.replication.database}|${item.replication.supportType}`
      }
      // Niveau 3: DB (regrouper par boite + app + database + supportType + schema)
      else if (codeBoite && app && db && !schema) {
        return `${item.replication.boite}|${item.replication.app}|${item.replication.database}|${item.replication.supportType}|${item.replication.schema}`
      }
      // Niveau 4: SCHEMA (pas de regroupement, retourner chaque réplication)
      else {
        return item.replication.id
      }
    }
    
    // Regrouper les résultats
    const grouped = {}
    filtered.forEach(item => {
      const key = groupByKey(item)
      
      if (!grouped[key]) {
        grouped[key] = {
          replication: {},
          statuses: new Set(),
          clientTypes: new Set(),
          count: 0
        }
      }
      
      // Ajouter les statuts et types de client
      item.statuses.forEach(s => grouped[key].statuses.add(s))
      item.clientTypes.forEach(ct => grouped[key].clientTypes.add(ct))
      
      // Agréger le compteur
      grouped[key].count += item.count
      
      // Copier les données de réplication selon le niveau
      if (!codeBoite && !app && !db && !schema) {
        // Niveau ROOT (retourner seulement boite)
        grouped[key].replication = {
          boite: item.replication.boite
        }
      } else if (codeBoite && !app && !db && !schema) {
        // Niveau CODEBOITE (retourner boite + app)
        grouped[key].replication = {
          boite: item.replication.boite,
          app: item.replication.app
        }
      } else if (codeBoite && app && !db && !schema) {
        // Niveau APP
        grouped[key].replication = {
          boite: item.replication.boite,
          app: item.replication.app,
          database: item.replication.database,
          supportType: item.replication.supportType
        }
      } else if (codeBoite && app && db && !schema) {
        // Niveau DB
        grouped[key].replication = {
          boite: item.replication.boite,
          app: item.replication.app,
          database: item.replication.database,
          supportType: item.replication.supportType,
          schema: item.replication.schema
        }
      } else {
        // Niveau SCHEMA (tous les champs)
        grouped[key].replication = { ...item.replication }
      }
    })
    
    // Fonction pour obtenir le statut le plus prioritaire
    const getHighestPriorityStatus = (statuses) => {
      const priorityOrder = ['ERROR', 'MAINTENANCE', 'PENDING', 'INACTIVE', 'ACTIVE']
      for (const status of priorityOrder) {
        if (statuses.has(status)) {
          return [status]
        }
      }
      return ['ACTIVE'] // Par défaut
    }
    
    // Convertir les Sets en Arrays et créer le tableau final
    const optimizedResponse = Object.values(grouped).map(group => ({
      replication: group.replication,
      statuses: getHighestPriorityStatus(group.statuses),
      clientTypes: Array.from(group.clientTypes),
      count: group.count
    }))
    
    const level = !codeBoite ? 'ROOT' : !app ? 'CODEBOITE' : !db ? 'APP' : !schema ? 'DB' : 'SCHEMA'
    console.log(`📊 POST /api/reports - ${optimizedResponse.length} groupes (niveau: ${level})`)
    res.json(optimizedResponse)
  } catch (error) {
    console.error('❌ Erreur POST /api/reports:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des rapports' })
  }
})

/**
 * POST /api/reports/export
 * Exporte les données au format JSON
 */
app.post('/api/reports/export', (req, res) => {
  try {
    const { codeBoite, app, db, schema } = req.body
    
    let filtered = [...replications]
    
    if (codeBoite) filtered = filtered.filter(r => r.replication.boite === codeBoite)
    if (app) filtered = filtered.filter(r => r.replication.app === app)
    if (db) filtered = filtered.filter(r => r.replication.database === db)
    if (schema) filtered = filtered.filter(r => r.replication.schema === schema)
    
    const exportData = {
      timestamp: new Date().toISOString(),
      criteria: { codeBoite, app, db, schema },
      reports: filtered
    }
    
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename=replications-export-${new Date().toISOString().split('T')[0]}.json`)
    res.json(exportData)
    
    console.log(`📤 Export de ${filtered.length} réplications`)
  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error)
    res.status(500).json({ error: 'Erreur lors de l\'export des données' })
  }
})

/**
 * POST /api/reports/import
 * Importe des données depuis un fichier JSON
 */
app.post('/api/reports/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' })
    }
    
    const fs = require('fs')
    const fileContent = fs.readFileSync(req.file.path, 'utf8')
    const importedData = JSON.parse(fileContent)
    
    if (!importedData.reports || !Array.isArray(importedData.reports)) {
      return res.status(400).json({ error: 'Format de fichier invalide' })
    }
    
    // Ajouter les réplications importées (sans doublons)
    let importCount = 0
    importedData.reports.forEach(report => {
      const exists = replications.find(r => 
        r.replication.boite === report.replication.boite &&
        r.replication.app === report.replication.app &&
        r.replication.supportConceptuel === report.replication.supportConceptuel
      )
      
      if (!exists) {
        report.replication.id = nextId++
        replications.push(report)
        importCount++
      }
    })
    
    // Supprimer le fichier temporaire
    fs.unlinkSync(req.file.path)
    
    console.log(`📥 Import réussi: ${importCount} réplications ajoutées`)
    res.json({ 
      count: importCount, 
      message: `${importCount} réplication(s) importée(s) avec succès` 
    })
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error)
    res.status(500).json({ error: 'Erreur lors de l\'import des données' })
  }
})

/**
 * POST /api/reports/statistics
 * Obtient les statistiques globales
 */
app.post('/api/reports/statistics', (req, res) => {
  try {
    const stats = {
      total: replications.length,
      active: replications.filter(r => r.statuses.includes('ACTIVE')).length,
      inactive: replications.filter(r => r.statuses.includes('INACTIVE')).length,
      byType: {
        SOURCE: replications.filter(r => r.replication.clientType === 'SOURCE').length,
        CIBLE: replications.filter(r => r.replication.clientType === 'CIBLE').length
      },
      byBoite: {}
    }
    
    // Compter par boîte
    replications.forEach(r => {
      const boite = r.replication.boite
      stats.byBoite[boite] = (stats.byBoite[boite] || 0) + 1
    })
    
    console.log('📈 Statistiques calculées')
    res.json(stats)
  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques:', error)
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques' })
  }
})

// ==================== ROUTES REPLICATIONS ====================

/**
 * GET /api/replications/:id/status
 * Récupère une réplication avec son statut
 */
app.get('/api/replications/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const replication = replications.find(r => r.replication.id === id)
    
    if (!replication) {
      return res.status(404).json({ error: 'Réplication non trouvée' })
    }
    
    console.log(`🔍 GET /api/replications/${id}/status`)
    res.json([replication])
  } catch (error) {
    console.error('❌ Erreur GET /api/replications/:id/status:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération de la réplication' })
  }
})

/**
 * POST /api/replications
 * Crée une nouvelle réplication
 */
app.post('/api/replications', (req, res) => {
  try {
    const newReplication = {
      replication: {
        id: nextId++,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      statuses: ['ACTIVE'],
      clientTypes: [req.body.clientType || 'SOURCE'],
      count: 0
    }
    
    replications.push(newReplication)
    
    console.log(`✅ POST /api/replications - ID: ${newReplication.replication.id}`)
    res.status(201).json(newReplication.replication)
  } catch (error) {
    console.error('❌ Erreur POST /api/replications:', error)
    res.status(500).json({ error: 'Erreur lors de la création de la réplication' })
  }
})

/**
 * PUT /api/replications/:id
 * Met à jour une réplication
 */
app.put('/api/replications/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const index = replications.findIndex(r => r.replication.id === id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Réplication non trouvée' })
    }
    
    replications[index].replication = {
      ...replications[index].replication,
      ...req.body,
      id: id,
      updatedAt: new Date().toISOString()
    }
    
    console.log(`✏️ PUT /api/replications/${id}`)
    res.json(replications[index].replication)
  } catch (error) {
    console.error('❌ Erreur PUT /api/replications/:id:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la réplication' })
  }
})

/**
 * DELETE /api/replications/:id
 * Supprime une réplication
 */
app.delete('/api/replications/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const index = replications.findIndex(r => r.replication.id === id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Réplication non trouvée' })
    }
    
    replications.splice(index, 1)
    delete statusHistory[id]
    
    console.log(`🗑️ DELETE /api/replications/${id}`)
    res.status(204).send()
  } catch (error) {
    console.error('❌ Erreur DELETE /api/replications/:id:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression de la réplication' })
  }
})

/**
 * POST /api/replications/:id/duplicate
 * Duplique une réplication avec tous ses enfants
 */
app.post('/api/replications/:id/duplicate', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const original = replications.find(r => r.replication.id === id)
    
    if (!original) {
      return res.status(404).json({ error: 'Réplication non trouvée' })
    }
    
    const { newLabel } = req.body
    
    // Fonction pour trouver tous les enfants récursivement
    const findAllChildren = (parentRep) => {
      const children = []
      
      // Trouver tous les enfants directs
      replications.forEach(rep => {
        const isChild = 
          rep.replication.boite === parentRep.boite &&
          rep.replication.app === parentRep.app &&
          rep.replication.database === parentRep.database &&
          rep.replication.supportType === parentRep.supportType &&
          rep.replication.schema === parentRep.schema &&
          rep.replication.id !== parentRep.id
        
        if (isChild) {
          children.push(rep)
          // Récursif: trouver les enfants de cet enfant
          const subChildren = findAllChildren(rep.replication)
          children.push(...subChildren)
        }
      })
      
      return children
    }
    
    // Dupliquer la réplication principale
    const duplicate = {
      replication: {
        ...original.replication,
        id: nextId++,
        supportConceptuel: newLabel || `${original.replication.supportConceptuel} (copie)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      statuses: [...original.statuses],
      clientTypes: [...original.clientTypes],
      count: original.count
    }
    
    replications.push(duplicate)
    
    // Trouver et dupliquer tous les enfants
    const children = findAllChildren(original.replication)
    const duplicatedChildren = []
    
    children.forEach(child => {
      const childDuplicate = {
        replication: {
          ...child.replication,
          id: nextId++,
          supportConceptuel: `${child.replication.supportConceptuel} (copie)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        statuses: [...child.statuses],
        clientTypes: [...child.clientTypes],
        count: child.count
      }
      
      replications.push(childDuplicate)
      duplicatedChildren.push(childDuplicate)
    })
    
    console.log(`📋 Duplication réussie - ID parent: ${duplicate.replication.id}, ${duplicatedChildren.length} enfants dupliqués`)
    res.status(201).json({
      parent: duplicate.replication,
      children: duplicatedChildren.map(c => c.replication),
      totalDuplicated: 1 + duplicatedChildren.length
    })
  } catch (error) {
    console.error('❌ Erreur lors de la duplication:', error)
    res.status(500).json({ error: 'Erreur lors de la duplication de la réplication' })
  }
})

/**
 * POST /api/replications/duplicate-batch
 * Duplique plusieurs réplications en une seule requête
 */
app.post('/api/replications/duplicate-batch', (req, res) => {
  try {
    const { replications: replicationsToDuplicate } = req.body
    
    if (!Array.isArray(replicationsToDuplicate) || replicationsToDuplicate.length === 0) {
      return res.status(400).json({ error: 'Le corps de la requête doit contenir un tableau de réplications' })
    }
    
    console.log(`📦 POST /api/replications/duplicate-batch - ${replicationsToDuplicate.length} réplications à dupliquer`)
    
    const results = []
    let successCount = 0
    
    // Fonction pour trouver tous les enfants récursivement
    const findAllChildren = (parentRep) => {
      const children = []
      replications.forEach(rep => {
        const isChild = 
          rep.replication.boite === parentRep.boite &&
          rep.replication.app === parentRep.app &&
          rep.replication.database === parentRep.database &&
          rep.replication.supportType === parentRep.supportType &&
          rep.replication.schema === parentRep.schema &&
          rep.replication.id !== parentRep.id
        
        if (isChild) {
          children.push(rep)
          const subChildren = findAllChildren(rep.replication)
          children.push(...subChildren)
        }
      })
      return children
    }
    
    // Dupliquer chaque réplication
    for (const item of replicationsToDuplicate) {
      const { id, newLabel } = item
      const original = replications.find(r => r.replication.id === id)
      
      if (!original) {
        results.push({ id, success: false, error: 'Réplication non trouvée' })
        continue
      }
      
      try {
        // Dupliquer la réplication principale
        const duplicate = {
          replication: {
            ...original.replication,
            id: nextId++,
            supportConceptuel: newLabel || `${original.replication.supportConceptuel} (copie)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          statuses: [...original.statuses],
          clientTypes: [...original.clientTypes],
          count: original.count
        }
        
        replications.push(duplicate)
        
        // Trouver et dupliquer tous les enfants
        const children = findAllChildren(original.replication)
        const duplicatedChildren = []
        
        children.forEach(child => {
          const childDuplicate = {
            replication: {
              ...child.replication,
              id: nextId++,
              supportConceptuel: `${child.replication.supportConceptuel} (copie)`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            statuses: [...child.statuses],
            clientTypes: [...child.clientTypes],
            count: child.count
          }
          
          replications.push(childDuplicate)
          duplicatedChildren.push(childDuplicate)
        })
        
        results.push({
          id,
          success: true,
          duplicatedId: duplicate.replication.id,
          childrenCount: duplicatedChildren.length,
          totalDuplicated: 1 + duplicatedChildren.length
        })
        
        successCount += 1 + duplicatedChildren.length
        console.log(`✅ Duplication réussie - ID origine: ${id}, ID copie: ${duplicate.replication.id}, ${duplicatedChildren.length} enfants`)
      } catch (error) {
        results.push({ id, success: false, error: error.message })
        console.error(`❌ Erreur duplication ID ${id}:`, error)
      }
    }
    
    console.log(`📊 Duplication en masse terminée: ${successCount} éléments dupliqués au total`)
    res.status(201).json({
      duplicated: successCount,
      results: results
    })
  } catch (error) {
    console.error('❌ Erreur lors de la duplication en masse:', error)
    res.status(500).json({ error: 'Erreur lors de la duplication en masse' })
  }
})

/**
 * GET /api/replications/:id/history
 * Récupère l'historique des statuts
 */
app.get('/api/replications/:id/history', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const history = statusHistory[id] || []
    
    console.log(`📜 GET /api/replications/${id}/history - ${history.length} entrées`)
    res.json(history)
  } catch (error) {
    console.error('❌ Erreur GET /api/replications/:id/history:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' })
  }
})

/**
 * POST /api/replications/:id/status-change
 * Crée une demande de changement de statut
 */
app.post('/api/replications/:id/status-change', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const replication = replications.find(r => r.replication.id === id)
    
    if (!replication) {
      return res.status(404).json({ error: 'Réplication non trouvée' })
    }
    
    const { newStatus, comment } = req.body
    
    // Ajouter à l'historique
    if (!statusHistory[id]) {
      statusHistory[id] = []
    }
    
    const historyEntry = {
      status: newStatus,
      changedAt: new Date().toISOString(),
      changedBy: 'user@example.com',
      comment: comment || ''
    }
    
    statusHistory[id].push(historyEntry)
    
    // Mettre à jour le statut
    if (!replication.statuses.includes(newStatus)) {
      replication.statuses.push(newStatus)
    }
    
    console.log(`🔄 Changement de statut pour ID ${id}: ${newStatus}`)
    res.status(201).json({
      requestId: statusHistory[id].length,
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Erreur POST /api/replications/:id/status-change:', error)
    res.status(500).json({ error: 'Erreur lors du changement de statut' })
  }
})

/**
 * GET /api/replications/search
 * Recherche globale
 */
app.get('/api/replications/search', (req, res) => {
  try {
    const { q } = req.query
    
    if (!q) {
      return res.status(400).json({ error: 'Paramètre de recherche manquant' })
    }
    
    const searchTerm = q.toLowerCase()
    const results = replications.filter(r => 
      r.replication.boite.toLowerCase().includes(searchTerm) ||
      r.replication.app.toLowerCase().includes(searchTerm) ||
      r.replication.database.toLowerCase().includes(searchTerm) ||
      r.replication.supportConceptuel.toLowerCase().includes(searchTerm)
    )
    
    console.log(`🔎 Recherche "${q}" - ${results.length} résultats`)
    res.json(results)
  } catch (error) {
    console.error('❌ Erreur GET /api/replications/search:', error)
    res.status(500).json({ error: 'Erreur lors de la recherche' })
  }
})

// ==================== ROUTES BOITES ====================

/**
 * GET /api/boites
 * Récupère toutes les boîtes applicatives
 */
app.get('/api/boites', (req, res) => {
  try {
    const boites = [
      { code: 'AAAA', libelle: 'Base A - Application principale' },
      { code: 'BBBB', libelle: 'Base B - Gestion commerciale' },
      { code: 'CCCC', libelle: 'Base C - Comptabilité et facturation' },
      { code: 'DDDD', libelle: 'Base D - Cartes virtuelles et analytics' }
    ]
    
    console.log('📦 GET /api/boites')
    res.json(boites)
  } catch (error) {
    console.error('❌ Erreur GET /api/boites:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des boîtes' })
  }
})

// ==================== ROUTES DE TEST ====================

/**
 * GET /api/health
 * Vérification de l'état du serveur
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    replications: replications.length
  })
})

// ==================== DÉMARRAGE DU SERVEUR ====================

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗')
  console.log('║   🚀 Serveur API de Réplications          ║')
  console.log('╠════════════════════════════════════════════╣')
  console.log(`║   URL: http://localhost:${PORT}              ║`)
  console.log(`║   Env: ${process.env.NODE_ENV || 'development'}                  ║`)
  console.log(`║   Données: ${replications.length} réplications en mémoire ║`)
  console.log('╚════════════════════════════════════════════╝')
  console.log('')
  console.log('📊 Statistiques de la base de données:')
  console.log(`   • ${new Set(replications.map(r => r.replication.boite)).size} boîtes applicatives`)
  console.log(`   • ${new Set(replications.map(r => `${r.replication.boite}-${r.replication.app}`)).size} applications`)
  console.log(`   • ${replications.filter(r => r.replication.clientType === 'SOURCE').length} réplications SOURCE`)
  console.log(`   • ${replications.filter(r => r.replication.clientType === 'CIBLE').length} réplications CIBLE`)
  console.log(`   • ${replications.filter(r => r.statuses.includes('ACTIVE')).length} ACTIVE, ${replications.filter(r => r.statuses.includes('INACTIVE')).length} INACTIVE`)
  console.log('')
  console.log('📚 Endpoints disponibles:')
  console.log('   POST   /api/reports')
  console.log('   POST   /api/reports/export')
  console.log('   POST   /api/reports/import')
  console.log('   POST   /api/reports/statistics')
  console.log('   GET    /api/replications/:id/status')
  console.log('   POST   /api/replications')
  console.log('   PUT    /api/replications/:id')
  console.log('   DELETE /api/replications/:id')
  console.log('   POST   /api/replications/:id/duplicate')
  console.log('   GET    /api/replications/:id/history')
  console.log('   POST   /api/replications/:id/status-change')
  console.log('   GET    /api/replications/search')
  console.log('   GET    /api/boites')
  console.log('   GET    /api/health')
  console.log('')
})

module.exports = app
