/**
 * Created by Sergey Trizna on 02.10.2017.
 */
export type XmlSchemaListTypes = Array<XmlSchemaItemType>;

export type XmlSchemaItemType = {
    Id: number,
    Name: string,
    Description: string,
    SchemaSubType: any,
    SchemaType:XmlSchemaType
};

export type XmlSchemaType = {
    Id: number,
    Value: string
};