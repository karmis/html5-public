/**
 * Created by Ivan Banan on 05.02.2020.
 */
export type PresetType = {
    Id: number,
    Name: string,
    SchemaId: number,
    Active:boolean
}

export type PresetGroupType = {
    Id: number,
    Name: string,
    Presets:Array<PresetType>,
    Color: string,
}
