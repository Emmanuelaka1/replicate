import type { 
  NodeReportDto, 
  ReportCriteriaDto, 
  ReplicationAndStatusDto,
  ReplicationDto 
} from './contract/data-contracts'

// Configuration de l'URL de base du serveur REST
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * Service REST pour la gestion des réplications
 */
class ReplicationRestApi {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Headers communs pour les requêtes
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  /**
   * Gestion des erreurs HTTP
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HTTP ${response.status}: ${error}`)
    }
    return response.json()
  }

  /**
   * Récupérer les rapports selon les critères
   */
  async findReports(criteria: ReportCriteriaDto): Promise<NodeReportDto[]> {
    const response = await fetch(
      `${this.baseUrl}/reports`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(criteria)
      }
    )

    return this.handleResponse<NodeReportDto[]>(response)
  }

  /**
   * Récupérer une réplication avec son statut par ID
   */
  async getReplicationAndStatusById(id: number): Promise<ReplicationAndStatusDto[]> {
    const response = await fetch(
      `${this.baseUrl}/replications/${id}/status`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    )

    return this.handleResponse<ReplicationAndStatusDto[]>(response)
  }

  /**
   * Créer une nouvelle réplication
   */
  async createReplication(replication: ReplicationDto): Promise<ReplicationDto> {
    const response = await fetch(
      `${this.baseUrl}/replications`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(replication)
      }
    )

    return this.handleResponse<ReplicationDto>(response)
  }

  /**
   * Mettre à jour une réplication existante
   */
  async updateReplication(id: number, replication: Partial<ReplicationDto>): Promise<ReplicationDto> {
    const response = await fetch(
      `${this.baseUrl}/replications/${id}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(replication)
      }
    )

    return this.handleResponse<ReplicationDto>(response)
  }

  /**
   * Supprimer une réplication
   */
  async deleteReplication(id: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/replications/${id}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Erreur lors de la suppression`)
    }
  }

  /**
   * Dupliquer une réplication avec ses enfants
   */
  async duplicateReplication(id: number, newLabel: string): Promise<ReplicationDto> {
    const response = await fetch(
      `${this.baseUrl}/replications/${id}/duplicate`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ newLabel })
      }
    )

    return this.handleResponse<ReplicationDto>(response)
  }

  /**
   * Dupliquer plusieurs réplications en une seule requête
   */
  async duplicateReplicationsBatch(replications: Array<{ id: number; newLabel: string }>): Promise<{ duplicated: number; results: any[] }> {
    const response = await fetch(
      `${this.baseUrl}/replications/duplicate-batch`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ replications })
      }
    )

    return this.handleResponse<{ duplicated: number; results: any[] }>(response)
  }

  /**
   * Exporter les données au format JSON
   */
  async exportData(criteria: ReportCriteriaDto): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/reports/export`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(criteria)
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Erreur lors de l'export`)
    }

    return response.blob()
  }

  /**
   * Importer des données depuis un fichier JSON
   */
  async importData(file: File): Promise<{ count: number; message: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(
      `${this.baseUrl}/reports/import`,
      {
        method: 'POST',
        body: formData
      }
    )

    return this.handleResponse<{ count: number; message: string }>(response)
  }

  /**
   * Récupérer l'historique des statuts d'une réplication
   */
  async getStatusHistory(replicationId: number): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/replications/${replicationId}/history`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    )

    return this.handleResponse<any[]>(response)
  }

  /**
   * Créer une demande de changement de statut
   */
  async createStatusChangeRequest(replicationId: number, newStatus: string, comment?: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/replications/${replicationId}/status-change`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ newStatus, comment })
      }
    )

    return this.handleResponse<any>(response)
  }

  /**
   * Récupérer toutes les boîtes applicatives
   */
  async getAllBoites(): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/boites`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    )

    return this.handleResponse<any[]>(response)
  }

  /**
   * Recherche globale dans les réplications
   */
  async searchReplications(searchTerm: string): Promise<NodeReportDto[]> {
    const response = await fetch(
      `${this.baseUrl}/replications/search?q=${encodeURIComponent(searchTerm)}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    )

    return this.handleResponse<NodeReportDto[]>(response)
  }

  /**
   * Obtenir les statistiques des réplications
   */
  async getStatistics(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/reports/statistics`,
      {
        method: 'POST',
        headers: this.getHeaders()
      }
    )

    return this.handleResponse<any>(response)
  }
}

// Export d'une instance unique
export const replicationRestApi = new ReplicationRestApi()

export default {
  reportApi: {
    findReports: (criteria: ReportCriteriaDto) => replicationRestApi.findReports(criteria)
  },
  replicationApi: {
    getReplicationAndStatusById: (id: number) => replicationRestApi.getReplicationAndStatusById(id),
    createReplication: (replication: ReplicationDto) => replicationRestApi.createReplication(replication),
    updateReplication: (id: number, replication: Partial<ReplicationDto>) => 
      replicationRestApi.updateReplication(id, replication),
    deleteReplication: (id: number) => replicationRestApi.deleteReplication(id),
    duplicateReplication: (id: number, newLabel: string) => 
      replicationRestApi.duplicateReplication(id, newLabel),
    duplicateReplicationsBatch: (replications: Array<{ id: number; newLabel: string }>) =>
      replicationRestApi.duplicateReplicationsBatch(replications),
    getStatusHistory: (replicationId: number) => replicationRestApi.getStatusHistory(replicationId),
    createStatusChangeRequest: (replicationId: number, newStatus: string, comment?: string) =>
      replicationRestApi.createStatusChangeRequest(replicationId, newStatus, comment),
    searchReplications: (searchTerm: string) => replicationRestApi.searchReplications(searchTerm),
    exportData: (criteria: ReportCriteriaDto) => replicationRestApi.exportData(criteria),
    importData: (file: File) => replicationRestApi.importData(file)
  }
}
