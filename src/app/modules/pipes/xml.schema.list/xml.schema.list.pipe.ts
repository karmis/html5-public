import {Pipe, PipeTransform} from '@angular/core';
import {XmlSchemaListTypes, XmlSchemaType} from "../../controls/xml.tree/types";
import {HttpService} from "../../../services/http/http.service";

export type XMLSchemasPipeType = {
    schemas: XmlSchemaListTypes,
    originSchemas: XmlSchemaListTypes,
    originSchemaTypes: XmlSchemaType,
    schemaTypesMap: Map<any, any>,
    schemaTypes: any[]
}

@Pipe({name: 'xmlSchemaList', pure: true})
export class XmlSchemaListPipe implements PipeTransform {
    constructor() {
    }

    transform(result: XmlSchemaListTypes): XMLSchemasPipeType {
        const schemas = result.sort(function (ob1, ob2) {
            let na = ob1.Name.toLowerCase(), nb = ob2.Name.toLowerCase();
            if (na < nb)
                return -1;
            if (na > nb)
                return 1;
            return 0;
        });

        const originSchemas = $.extend(true, {}, schemas);
        let schemaTypesMap = new Map();
        let filtered = result.filter(el => el.SchemaType);
        for (let schema of filtered) {
            if (!schemaTypesMap.get(schema.SchemaType.Id)) {
                schemaTypesMap.set(schema.SchemaType.Id, {
                    schemaType: schema.SchemaType,
                    Children: [],
                    Name: schema.SchemaType.Value
                });
            }
            schemaTypesMap.get(schema.SchemaType.Id).Children.push(schema);
        }

        const schemaTypes = Array.from(schemaTypesMap).map(el => el[1]);
        let originSchemaTypes = $.extend(true, {}, schemaTypes);
        originSchemaTypes = Object.keys(originSchemaTypes).map(function (key) {
            return originSchemaTypes[key];
        });

        return {
            schemas: schemas,
            originSchemas: originSchemas,
            originSchemaTypes: originSchemaTypes,
            schemaTypesMap: schemaTypesMap,
            schemaTypes: schemaTypes
        };
    }
}
