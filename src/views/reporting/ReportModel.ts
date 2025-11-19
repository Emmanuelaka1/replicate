import type { NodeReportDto, ReportCriteriaDto } from '@/api/contract/data-contracts'
import api from '@/api/reportTestApi'
import { useCodeBoiteStore } from '@/stores/useCodeBoiteStore'
import { useKeyStore } from '@/stores/userKeyStore'
export interface ReportModel {
codeBoite: string
id: string
key: number
report: NodeReportDto | undefined
iconeurl: string | undefined
titleIcone: string | undefined
criteria: ReportCriteriaDto
hasChildren: boolean
children: ReportModel[]
label: string
statuses: string[] | undefined
count: number | string
open: boolean
typeSearch: string
load(resolve: (data: ReportModel[]) => void): void
}

export abstract class ReportAbstract implements ReportModel {
id = ''
key !: number
codeBoite: string
report: NodeReportDto
hasChildren = true
children: ReportModel[] = []
iconeurl = ''
titleIcone = ''
criteria: ReportCriteriaDto
label =''
statuses: string[] | undefined
count: number
nbreRplSrc: number
nbreRplCibl: number
supportType =''
open: boolean
typeSearch =''

constructor(report: NodeReportDto, criteria: ReportCriteriaDto) {
this.report = report
this.statuses = ['INACTIVE']
this.count = report.count ?? 0
this.nbreRplSrc = 0
this.nbreRplCibl = 0
this.criteria = { ... criteria }
this.open = false
this.codeBoite = this. criteria.codeBoite ?? ''
}

    initCriteria(criteria: ReportCriteriaDto, typeSearch: string) {
        criteria.codeBoite = this.report?.replication?.boite ?? ''
        criteria.app = this.report?.replication?.app ?? ''
        criteria.db = this.report?.replication?.database ?? ''
        criteria.schema = this.report?.replication?.schema ?? ''
        criteria.support = this.report?.replication?.supportConceptuel ?? ''
        criteria.typeSupport = this.report?.replication?.supportType ?? ''
        this.typeSearch = typeSearch
        this.open = true
    }initOpen(children: ReportModel[]) {
this.open = children.length > 0
}

load(resolve: (data: ReportModel[]) => void) {
resolve(this.children)
}

    initData(resolve: (data: ReportModel[]) => void, typeSearch: string) {
        console.log('initData typeSearch : ', typeSearch)
        this.initCriteria(this.criteria, typeSearch)
        const reportsRes = api.reportApi.findReports(this.criteria)
        reportsRes.then((d: Response) => d.json())
            .then((reports: NodeReportDto[]) => {
                this.applyReport(reports)
                resolve(this.children)
            }).catch((error: any) => console.error('Erreur lors du chargement des rapports:', error))
    }

    applyReport(reports: NodeReportDto[]) {
        const keyStore = useKeyStore()
        switch (this.typeSearch) {
            case 'CODEBOITE':
                reports.forEach((report) => this.children.push(new ReportApp(report, this.criteria, keyStore.key++)))
                break
            case 'APP':
                reports.forEach((report) => this.children.push(new ReportDb(report, this.criteria, keyStore.key++)))
                break
            case 'DB':
                reports.forEach((report) => this.children.push(new ReportSchema(report, this.criteria, keyStore.key++)))
                break
            case 'SCHEMA':
                reports.forEach((report) =>
                    this.children.push(new ReplicationStatusReportModel(report, this.criteria, keyStore.key++)),
                )
                break
        }
    }
}

export class ReportBoite extends ReportAbstract {
    constructor(report: NodeReportDto, criteria: ReportCriteriaDto, key: number) {
        super(report, criteria)
        this.key = key
        this.id = this.report.replication?.boite || ''
        this.label = this.report.replication?.boite || ''
        this.iconeurl = 'icon-code-boite'
        this.titleIcone = 'boite applicative (code boite) '
        this.statuses = report?.statuses?.length === 0 ? ['INACTIVE'] : report?.statuses
        this.open = false
        this.addLabel()
    }
    addLabel() {
        const store = useCodeBoiteStore()
        if (store.parametrage.allBoites) {
            for (const boite of store.parametrage.allBoites) {
                if (boite.code === this.report.replication?.boite) {
                    this.label += ' - ' + boite.libelle
                    break
                }
            }
        } else {
            console.log('chargement des codes boites a partir de dicoref : non ok')
        }
    }
    load(resolve: (data: ReportModel[]) => void) {
        this.initData(resolve, 'CODEBOITE')
    }
}

export class ReportApp extends ReportAbstract {
    constructor(report: NodeReportDto, criteria: ReportCriteriaDto, key: number) {
        super(report, criteria)
        this.key = key
        this.id = `${this.report.replication?.boite}/${this.report.replication?.app}`
        this.label = this.report.replication?.app || ''
        this.statuses = report?.statuses?.length === 0 ? ['INACTIVE'] : report?.statuses
        this.iconeurl = 'icon-application'
        this.titleIcone = 'application'
        this.open = false
    }
    load(resolve: (data: ReportModel[]) => void) {
        this.initData(resolve, 'APP')
    }
}

export class ReportDb extends ReportAbstract {
    constructor(report: NodeReportDto, criteria: ReportCriteriaDto, key: number) {
        super(report, criteria)
        this.key = key
        this.id = `${this.report.replication?.boite}/${this.report.replication?.app}/${this.report.replication?.database}/${this.report.replication?.supportType}`
        this.label = `${this.report.replication?.database}/${this.report.replication?.supportType}`
        this.statuses = report.statuses?.length === 0 ? ['INACTIVE'] : report.statuses
        this.iconeurl = 'icon-basededonnees'
        this.titleIcone = 'base (type, base de données) '
        this.open = false
    }
    load(resolve: (data: ReportModel[]) => void) {
        this.initData(resolve, 'DB')
    }
}

export class ReportSchema extends ReportAbstract {
    constructor(report: NodeReportDto, criteria: ReportCriteriaDto, key: number) {
        super(report, criteria)
        this.key = key
        this.id = `${this.report.replication?.boite}/${this.report.replication?.app}/${this.report.replication?.database}/${this.report.replication?.supportType
            }/${this.report.replication?.schema}`
        this.label = this.report.replication?.schema || ''
        this.statuses = report?.statuses?.length === 0 ? ['INACTIVE'] : report?.statuses
        this.iconeurl = 'icon-shema'
        this.titleIcone = 'shéma de base de données'
        this.open = false
    }
    load(resolve: (data: ReportModel[]) => void) {
        this.initData(resolve, 'SCHEMA')
    }
}

export class ReplicationStatusReportModel extends ReportAbstract {
id: string
hasChildren = false
children = []
label: string
statuses: string[] | undefined
iconeurl = ''
titleIcone = ''
iconeReplType = ''
iconeReplTitle = ''
criteria: ReportCriteriaDto
clientType: string
infos: string
open: boolean

constructor(report: NodeReportDto, criteria: ReportCriteriaDto, key: number) {
super(report, criteria)
this.open = false
this.key = key
this.id = String(report.replication?.id)
this.criteria = { ...criteria }
this.label = report.replication?.supportConceptuel ?? ''
this.statuses = report.statuses
this.clientType = report.replication?.clientType ?? report.clientType ?? ''
this.infos = ''
this.iconeurl = 'icon-replication'
this.titleIcone = 'réplication'
this.iconeReplType = this.replicationTypeIcon(report.replication?.clientType)
this.iconeReplTitle = this.replicationType(report.replication?.clientType)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars

load(_resolve: (data: ReportModel[]) => void): void {}
replicationType(rplType: string | undefined): string {
if (rplType === 'CIBLE') return 'Réplication cible'
else return 'Réplication Source'
}
replicationTypeIcon(rplType: string | undefined) : string {
if (rplType === 'CIBLE') return 'icon-repl-cible '
else return 'icon-repl-source'
}
}

export class ReporInfos {
    schema: ReportModel
    db: ReportModel
    application: ReportModel
    codeBoite: ReportModel
    constructor(s: ReportModel, dataBase: ReportModel, app: ReportModel, cb: ReportModel) {
        this.schema = s
        this.db = dataBase
        this.application = app
        this.codeBoite = cb
    }
}