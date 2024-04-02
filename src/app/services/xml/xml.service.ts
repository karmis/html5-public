/**
 * Created by Pavel on 17.01.2017.
 */
import {Injectable} from "@angular/core";
import {HttpService} from "../http/http.service";
import {Observable,  Subscription } from "rxjs";
import {SessionStorageService} from "ngx-webstorage";
import {XmlSchemaListTypes} from "../../modules/controls/xml.tree/types";
import {FlatMap} from "../../modules/controls/xml.tree/model/imfx.xml.tree";
import {IMFXXMLNode} from "../../modules/controls/xml.tree/model/imfx.xml.node";
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { jsonParseHelper } from '../../utils/imfx.common';

/**
 * XML service
 */
@Injectable()
export class XMLService {

    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {

    }

    deleteSettingsXmlSchema(id) {
        return this.httpService
            .delete(
                '/api/v3/config/xmlschema/' + id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getSettingsXmlSchema(id) {
        return this.httpService
            .get(
                '/api/v3/config/xmlschema/' + id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    addSettingsXmlSchema(data) {
        return this.httpService
            .post(
                '/api/v3/config/xmlschema',
                JSON.stringify(data)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getSettingsXslts() {
        return this.httpService
            .get(
                '/api/v3/config/xmltransforms'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getSettingsXsltSchema(id) {
        return this.httpService
            .get(
                '/api/v3/config/xmltransform/' + id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    addSettingsXsltSchema(data) {
        return this.httpService
            .post(
                '/api/v3/config/xmltransform',
                JSON.stringify(data)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    editSettingsXsltSchema(data, id) {

        return this.httpService
            .put(
                '/api/v3/config/xmltransform/' + id,
                JSON.stringify(data)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getXmlData(id: number, fromStorage = true): Observable<Subscription> {
        let key = 'xmlschema.' + id;
        let data = this.sessionStorage.retrieve(key);
        return new Observable((observer: any) => {
            if (!data || !fromStorage) {
                this.httpService
                    .get(
                        '/api/xml-schema/' + id
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (res: any) => {
                            this.sessionStorage.store(key, res);
                            observer.next(res);
                        }, (err) => {
                            observer.error(err);
                        }, () => {
                            observer.complete();
                        });
            } else {
                observer.next(data);
                observer.complete();
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                //         observer.next(data);
                //         observer.complete();
                //     });
            }
        });
    }

    getXmlDocument(id) {
        return this.httpService
            .get(
                '/api/xmldocument/' + id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getXmlForMetadata(itemId, type) {
        return this.httpService
            .get(
                '/api/metadata/' + type + "/" + itemId
            )
            .pipe(map((res: any) => {
                return res.body;
            }))
    }

    getSchemaList(forceReload: boolean = false): Observable<XmlSchemaListTypes> {
        let key = 'xmlschemas.all';
        let data = this.sessionStorage.retrieve(key);
        return new Observable((observer: any) => {
            if (!data || forceReload) {
                this.httpService
                    .get(
                        '/api/xml-schemas/'
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (res: any) => {
                            this.sessionStorage.store(key, res);
                            observer.next(res);
                        }, (err) => {
                            observer.error(err);
                        }, () => {
                            observer.complete();
                        });
            } else {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                        observer.next(data);
                        observer.complete();
                    // });
            }
        });
    }
    saveXmlDocument(xmlDocAndSchema, id = null): Observable<HttpResponse<any>> {
        return this.httpService
            .post(
                '/api/xmldocument/' + (id == null ? "0": id),
                JSON.stringify(xmlDocAndSchema, function(key, value) {
                    return jsonParseHelper(key, value);
                })
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    flatSchema: Array<FlatMap> = [];

    createFlatSchema(nodes: IMFXXMLNode[]) {
        for (let node of nodes) {
            this.flatSchema.push(<FlatMap>{"Id":node.Id, "Node":node});
            if(node.Children) {
                this.createFlatSchema(node.Children);
            }
        }
    }
    // find SchemaModel with such Id
    findSchemaNodeById(id) {
        let found = undefined;
        for (let map of this.flatSchema) {
            if (map.Id == id) {
                found = map.Node;
                break;
            }
        }
        return found;
    }
}
