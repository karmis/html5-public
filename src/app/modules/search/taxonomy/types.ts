/**
 * Created by Sergey Trizna on 02.10.2017.
 */
export type TaxonomyType = {
    ID: number,
    Name: string,
    NodeType: string,
    NodeName: string,
    ParentID?: number,
    Children?: Array<TaxonomyType>
}
