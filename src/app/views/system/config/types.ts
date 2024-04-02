export type SettingsGroupGridItemType = {
    Id?: number,
    Name?: string,
    Description?: string,
    IdText?: number,
    $id?: number | string
}

export type SettingsGroupType = {
    ID?: number,
    NAME?: string,
    DESCRIPTION?: string | null,
    EntityKey?: EntityKeyType,
    TM_SETTINGS_KEYS?: TMSettingsKeyType[],
    VISUAL_ASSETS_GROUP_ID?: string
}

export type TMSettingsKeyType = {
    $id?: string,
    DATA?: string,
    EntityKey?: EntityKeyType,
    GROUP_ID?: number,
    ID?: number,
    KEY?: string,
    TM_SETTINGS_GROUPS?: EntityKeyType,
    TM_SETTINGS_GROUPSReference?: {
        EntityKey: EntityKeyType
    },
    VALUE?: any
}

export type EntityKeyType = {
    $id: string,
    EntityContainerName: string,
    EntityKeyValues: {
        Key: string,
        Value: number
    }[],
    EntitySetName: string
} | {
    $ref: string
}
