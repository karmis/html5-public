export type MakeOfficer = {
    ProductionIds: number[],
    OfficerType: OfficerType,
    OfficerId: null | number
}
export type OfficerType = 'Compliance' | 'Assistant' | 'ClearCompliance' | 'ClearAssistant';
export type ProductionTypeDetail = 'create' | 'production-manager' | 'clone' | 'production-search' | 'production-my';
export type MakeItems = 'approve' | 'reject' | 'start' | 'restart' | 'complete' | 'abort';