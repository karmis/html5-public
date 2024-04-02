export type LIPageMode = 'list' | 'detail' | 'new'
export type LITypeImages = {
    0: LIVisualAsset,
    1: LIVisualAsset,
    2: LIVisualAsset,
    3: LIVisualAsset,
    4: LIVisualAsset,
}
// typeImages = {
//     0: 'small logo (light theme)',
//     1: 'small logo (dark theme)',
//     2: 'search logo (light theme)',
//     3: 'search logo (dark theme)',
// }
export type LITypeImagesServer = 0 | 1 | 2 | 3 | 4 ;
export type LIVisualAssetGroup = {
    ID?: string,
    NAME: string,
}
export type LIVisualAsset = {
    ID?: number,
    TYPE_ID: LITypeImagesServer,
    DATA?: string,
    DATA_BASE64: string,
    GROUP_ID: string,
}
