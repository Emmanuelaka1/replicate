export interface NodeReportDto {
  replication?: ReplicationDto
  statuses?: string[]
  clientTypes?: string[]
  clientType?: string
  count?: number
}

export interface ReplicationDto {
  id?: number
  boite?: string
  app?: string
  supportConceptuel?: string
  table?: string
  supportType?: string
  database?: string
  schema?: string
  clientType?: string
}

export interface ReportCriteriaDto {
  codeBoite?: string
  app?: string
  db?: string
  schema?: string
  support?: string
  typeSupport?: string
  clientType?: string
}

export interface ReplicationAndStatusDto {
  replication?: ReplicationDto
  statuses?: string[]
}
