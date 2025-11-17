import type { NodeReportDto, ReportCriteriaDto, ReplicationAndStatusDto } from './contract/data-contracts'

// Données de test simulant les réponses de l'API
const mockData = {
  codeBoites: [
    {
      replication: { boite: 'DDDD' },
      statuses: ['ACTIVE'],
      clientTypes: ['SOURCE'],
      count: 4
    },
    {
      replication: { boite: 'CCCC' },
      statuses: ['ACTIVE'],
      clientTypes: ['SOURCE'],
      count: 2
    },
    {
      replication: { boite: 'BBBB' },
      statuses: ['ACTIVE'],
      clientTypes: ['SOURCE'],
      count: 1
    },
    {
      replication: { boite: 'AAAA' },
      statuses: ['ACTIVE'],
      clientTypes: ['SOURCE'],
      count: 1
    }
  ],
  apps: {
    DDDD: [
      {
        replication: {
          boite: 'DDDD',
          app: 'cardvirtrplsource',
          supportType: 'DB2MVS',
          database: 'LOCDV0O'
        },
        statuses: ['ACTIVE'],
        clientTypes: ['SOURCE'],
        count: 4
      }
    ],
    CCCC: [
      {
        replication: {
          boite: 'CCCC',
          app: '0520 - Cartes Virtuelles',
          supportType: 'DB2MVS',
          database: 'LOCCV00'
        },
        statuses: ['ACTIVE'],
        clientTypes: ['SOURCE'],
        count: 2
      }
    ],
    BBBB: [
      {
        replication: {
          boite: 'BBBB',
          app: '2900 - Oppositions',
          supportType: 'DB2MVS',
          database: 'LOCBV00'
        },
        statuses: ['ACTIVE'],
        clientTypes: ['SOURCE'],
        count: 1
      }
    ],
    AAAA: [
      {
        replication: {
          boite: 'AAAA',
          app: 'opporplsource',
          supportType: 'DB2MVS',
          database: 'LOCAV00'
        },
        statuses: ['ACTIVE'],
        clientTypes: ['SOURCE'],
        count: 1
      }
    ]
  },
  databases: {
    'DDDD-cardvirtrplsource': [
      {
        replication: {
          boite: 'DDDD',
          app: 'cardvirtrplsource',
          supportType: 'DB2MVS',
          database: 'LOCDV0O',
          schema: 'V01DBA'
        },
        statuses: ['ACTIVE'],
        clientTypes: ['SOURCE'],
        count: 2
      },
      {
        replication: {
          boite: 'DDDD',
          app: 'cardvirtrplsource',
          supportType: 'DB2MVS',
          database: 'LOCDV0O',
          schema: 'V03DBA'
        },
        statuses: ['ACTIVE'],
        clientTypes: ['SOURCE'],
        count: 2
      }
    ]
  },
  schemas: {
    'DDDD-cardvirtrplsource-LOCDV0O-V01DBA': [
      {
        replication: {
          id: 26,
          boite: 'DDDD',
          app: 'cardvirtrplsource',
          supportConceptuel: 'T05CARV',
          table: 'T05CARV',
          supportType: 'DB2MVS',
          database: 'LOCDV0O',
          schema: 'V01DBA'
        },
        clientType: 'SOURCE',
        statuses: ['ACTIVE'],
        clientTypes: ['SOURCE'],
        count: 1
      },
      {
        replication: {
          id: 27,
          boite: 'DDDD',
          app: 'cardvirtrplsource',
          supportConceptuel: 'T05PARV',
          table: 'T05PARV',
          supportType: 'DB2MVS',
          database: 'LOCDV0O',
          schema: 'V01DBA'
        },
        clientType: 'SOURCE',
        statuses: ['ACTIVE'],
        clientTypes: ['SOURCE'],
        count: 1
      }
    ],
    'DDDD-cardvirtrplsource-LOCDV0O-V03DBA': [
      {
        replication: {
          id: 28,
          boite: 'DDDD',
          app: 'cardvirtrplsource',
          supportConceptuel: 'T06CARV',
          table: 'T06CARV',
          supportType: 'DB2MVS',
          database: 'LOCDV0O',
          schema: 'V03DBA'
        },
        clientType: 'SOURCE',
        statuses: ['ACTIVE'],
        clientTypes: ['SOURCE'],
        count: 1
      },
      {
        replication: {
          id: 29,
          boite: 'DDDD',
          app: 'cardvirtrplsource',
          supportConceptuel: 'T06PARV',
          table: 'T06PARV',
          supportType: 'DB2MVS',
          database: 'LOCDV0O',
          schema: 'V03DBA'
        },
        clientType: 'SOURCE',
        statuses: ['ACTIVE'],
        clientTypes: ['SOURCE'],
        count: 1
      }
    ]
  },
  replications: {
    26: {
      replication: {
        id: 26,
        boite: 'DDDD',
        app: 'cardvirtrplsource',
        supportConceptuel: 'T05CARV',
        table: 'T05CARV',
        supportType: 'DB2MVS',
        database: 'LOCDV0O',
        schema: 'V01DBA',
        clientType: 'SOURCE'
      },
      statuses: ['ACTIVE']
    },
    27: {
      replication: {
        id: 27,
        boite: 'DDDD',
        app: 'cardvirtrplsource',
        supportConceptuel: 'T05PARV',
        table: 'T05PARV',
        supportType: 'DB2MVS',
        database: 'LOCDV0O',
        schema: 'V01DBA',
        clientType: 'SOURCE'
      },
      statuses: ['ACTIVE']
    }
  }
}

class ReportTestApi {
  // Simule un délai réseau
  private delay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Simule une réponse fetch
  private createResponse<T>(data: T): Promise<Response> {
    return Promise.resolve({
      json: () => Promise.resolve(data),
      ok: true,
      status: 200
    } as Response)
  }

  // Récupère les rapports selon les critères de façon progressive (lazy loading)
  async findReports(criteria: ReportCriteriaDto): Promise<Response> {
    await this.delay()

    console.log('findReports appelé avec critères:', criteria)

    // Niveau 1: Si aucun critère, retourner les codes boites
    if (!criteria.codeBoite || criteria.codeBoite === '') {
      console.log('→ Retour des codes boîtes')
      return this.createResponse(mockData.codeBoites)
    }

    // Niveau 2: Si code boite uniquement (sans app ou app vide), retourner les applications
    if (criteria.codeBoite && (!criteria.app || criteria.app === '')) {
      console.log('→ Retour des applications pour boîte:', criteria.codeBoite)
      const apps = mockData.apps[criteria.codeBoite as keyof typeof mockData.apps] || []
      return this.createResponse(apps)
    }

    // Niveau 3: Si code boite + app (sans db ou db vide), retourner les bases de données
    if (criteria.codeBoite && criteria.app && (!criteria.db || criteria.db === '')) {
      console.log('→ Retour des databases pour:', criteria.codeBoite, criteria.app)
      const key = `${criteria.codeBoite}-${criteria.app}`
      const dbs = mockData.databases[key as keyof typeof mockData.databases] || []
      return this.createResponse(dbs)
    }

    // Niveau 4: Si code boite + app + db (sans schema ou schema vide), retourner les schémas
    if (criteria.codeBoite && criteria.app && criteria.db && (!criteria.schema || criteria.schema === '')) {
      console.log('→ Retour des schémas pour:', criteria.codeBoite, criteria.app, criteria.db)
      const key = `${criteria.codeBoite}-${criteria.app}`
      // Retourner tous les schémas disponibles pour cette base
      const dbs = mockData.databases[key as keyof typeof mockData.databases] || []
      return this.createResponse(dbs)
    }

    // Niveau 5: Si schema spécifié, retourner les réplications
    if (criteria.codeBoite && criteria.app && criteria.db && criteria.schema) {
      console.log('→ Retour des réplications pour:', criteria.codeBoite, criteria.app, criteria.db, criteria.schema)
      const key = `${criteria.codeBoite}-${criteria.app}-${criteria.db}-${criteria.schema}`
      const schemas = mockData.schemas[key as keyof typeof mockData.schemas] || []
      return this.createResponse(schemas)
    }

    console.log('→ Aucune correspondance, retour vide')
    return this.createResponse([])
  }

  // Récupère une réplication par ID
  async getReplicationAndStatusById(id: number): Promise<Response> {
    await this.delay()
    const replication = mockData.replications[id as keyof typeof mockData.replications]
    if (replication) {
      return this.createResponse([replication] as ReplicationAndStatusDto[])
    }
    return this.createResponse([])
  }

  // Supprime une réplication
  async deleteReplication(id: number): Promise<Response> {
    await this.delay()
    console.log(`Suppression de la réplication ${id}`)
    return this.createResponse({ success: true, message: 'Réplication supprimée' })
  }
}

// Instance singleton de l'API
export const reportTestApi = new ReportTestApi()

// Export pour l'utilisation dans les composants
export default {
  reportApi: reportTestApi,
  replicationApi: reportTestApi
}
