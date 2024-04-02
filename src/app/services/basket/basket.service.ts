import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {SessionStorageService} from "ngx-webstorage";
import {HttpService} from "../http/http.service";
import {ServerStorageService} from "../storage/server.storage.service";
import {LoginProvider} from "../../views/login/providers/login.provider";
import {NotificationService} from "../../modules/notification/services/notification.service";
import {MediaClip} from "../../views/clip-editor/rce.component";
import {map} from 'rxjs/operators';
import {JsonProvider} from '../../providers/common/json.provider';
import {HttpErrorResponse} from '@angular/common/http';

/**
 * Media basket service
 */
@Injectable()
export class BasketService {
    public itemAddedRemoved: EventEmitter<any> = new EventEmitter<any>();
    public onPlaceOrder: EventEmitter<any> = new EventEmitter<any>();
    private dataStore: {  // This is where we will store our data in memory
        items: any[]
    };

    constructor(private httpService: HttpService,
                private storage: SessionStorageService,
                private loginProvider: LoginProvider,
                private notificationService: NotificationService,
                private jsonProvider: JsonProvider,
                private serverStorage: ServerStorageService,) {
        this._items = <BehaviorSubject<any[]>>new BehaviorSubject([]);
        if (this.loginProvider.isLogged) {
            this.retrieveItems();
        }
    }

    private _items: BehaviorSubject<any[]>;

    get items() {
        return this._items.asObservable();
    }

    ngOnDestroy() {
        this._items.complete();
    }

    public checkActiveTask(id) {
        return this.httpService
            .get(
                "/api/v3/job/" + id + "/activetask"
            )
            .pipe(map((res: any) => {
                return res.body;
            }));

    }

    public retrieveItems() {
        return this.serverStorage.retrieve(['media.basket.data']).subscribe((res: any) => {
            const value = res && res[0].Value;
            const mediaBasketData = this.jsonProvider.isValidJSON(value)
                ? JSON.parse(value)
                : value || null;
            if (mediaBasketData) {
                this.dataStore = mediaBasketData;
            } else {
                this.dataStore = {items: []};
            }

            this.setItems(this.dataStore);
        });
    }

    getBasketItemsCount() {
        return this.dataStore.items.length;
    }

    addToBasket(item: any, type: 'Media' | 'Version' | 'Tape', save: boolean = true): void {
        //this.notificationService.notifyShow(1, "Item " + item.TITLE + " added to basket");
        item.basket_item_type = type;
        this.dataStore.items.unshift(item); //push(item);
        this._items.next(Object.assign({}, this.dataStore).items);
        this.itemAddedRemoved.emit();
        if (save) {
            this.serverStorage.store('media.basket.data', this.dataStore).subscribe(() => {

            });
        }
    }

    removeFromBasket(item: any): void {
        // TODO: review remove
        let items = this.dataStore.items;
        for (let i = 0; i < item.length; i++) {
            items = items.filter((el) => el.ID != item[i].ID);
            item[i].ordered = false;
        }
        this.dataStore.items = items;
        this._items.next((Object.assign({}, this.dataStore).items));
        this.itemAddedRemoved.emit();
        this.serverStorage.store('media.basket.data', this.dataStore).subscribe((res: any) => {
            console.log(res);
        });
    }

    hasItem(item: any): boolean {
        return this.dataStore && this.dataStore.items.filter(function (el) {
            return el.ID == item.ID;
        }).length > 0;
    }

    getOrderPresets(cacheClear: boolean = true): Observable<any[]> {
        const storageKey = 'settings-group.order.presets';
        const data = this.storage.retrieve(storageKey);
        return new Observable((observer) => {
                if (!data || cacheClear) {
                    return this.httpService
                        .get(
                            '/api/v3/order-presets'
                        )
                        .pipe(map((res: any) => {
                            return res.body;
                        })).subscribe((res) => {
                            this.storage.store(storageKey, res);
                            observer.next(res);
                        }, (err) => {
                            observer.error(err);
                        }, () => {
                            observer.complete();
                        });
                } else {
                    observer.next(data);
                    observer.complete();
                }
            }
        );
    }

    getOrderPresetsGrouped() {
        return this.httpService
            .get(
                '/api/v3/order-presets-grouped'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    placeOrderClipsFast(param: {
        itemType: any,
        itemId: any,
        preset: any,
        note: any,
        schemaId?: number,
        clips?: MediaClip[],
        xmlDocAndSchema?: any,
        CompleteByDate: string,
        VersionSourceType?: 'media' | 'version'
    }) {
        let postData = {
            "PresetId": param.preset ? param.preset.Id : null,
            "Media": [],
            "Notes": param.note,
            "SchemaId": param.schemaId,
            "CompleteByDate": param.CompleteByDate,
            "XmlDocAndSchema": param.xmlDocAndSchema,
            "VersionSourceType": param.VersionSourceType
        };

        if (param.clips && param.clips.length) {
            // let mediaItems = [];
            // let mediaItemsPlain = {};
            // for (let clip of param.clips) {
            //   if (mediaItemsPlain[clip.mediaId]) {
            //     mediaItemsPlain[clip.mediaId].Subclips.push({
            //       "In": clip.start,
            //       "Out": clip.end,
            //     })
            //   } else {
            //     mediaItemsPlain[clip.mediaId] = {
            //       "Id": clip.mediaId,
            //       "Type": "Media",
            //       "Subclips": []
            //     }
            //     mediaItemsPlain[clip.mediaId].Subclips.push({
            //       "In": clip.start,
            //       "Out": clip.end,
            //     })
            //     mediaItems.push(mediaItemsPlain[clip.mediaId])
            //   }
            // }
            postData.Media = param.clips.map(el => {
                return {
                    "Id": el.mediaId,
                    "ItemType": "Media",
                    "Subclips": [{
                        "In": el.start,
                        "Out": el.end,
                    }]
                };
            });
        } else {
            postData.Media = [{"Id": param.itemId, "ItemType": param.itemType}];
        }

        return this.httpService
            .post(
                '/api/v3/mediaorder',
                JSON.stringify(postData, this.httpService.getCircularReplacer())
            ).pipe(map((res: any) => {
                this.dataStore.items = this.dataStore.items.filter(el => !el.selected); // remove ordered items from basket
                this._items.next((Object.assign({}, this.dataStore).items)); // and notify everybody about it
                this.serverStorage.store('media.basket.data', this.dataStore).subscribe((res: any) => {
                    console.log(res);
                });
                return res.body;
            }, (err: HttpErrorResponse) => {
                return err;
            }));

    }

    placeOrder(param: {
        preset: any,
        note: any,
        schemaId?: number,
        xmlDocAndSchema?: any,
        CompleteByDate: string,
        removeItemsFromBasket?: boolean,
        WorkflowPerItem: boolean
    }) {

        let postData = {
            "PresetId": param.preset.Id,
            "Notes": param.note,
            "CompleteByDate": param.CompleteByDate,
            "Media": this.dataStore.items
                // .filter(item => item.selected)
                .map(item => {
                    return {Id: item.ID, ItemType: item.basket_item_type};
                }),
            "SchemaId": param.schemaId,
            "XmlDocAndSchema": param.xmlDocAndSchema,
            "WorkflowPerItem": param.WorkflowPerItem
        };

        return this.httpService
            .post(
                '/api/v3/mediaorder',
                JSON.stringify(postData, this.httpService.getCircularReplacer())
            )
            .pipe(map((res: any) => {
                if (param.removeItemsFromBasket) { // remove all items
                    this.dataStore.items = []; // this.dataStore.items.filter(el => !el.selected); // remove ordered items from basket
                    this._items.next((Object.assign({}, this.dataStore).items)); // and notify everybody about it
                    this.serverStorage.store('media.basket.data', this.dataStore).subscribe((res: any) => {
                        console.log(res);
                    });
                }
                this.onPlaceOrder.emit(res.body);
                return res.body;
            }, (err: HttpErrorResponse) => {
                return err;
            }));
    }

    placeOrderFast(param: {
        preset: any,
        note: any,
        items: any,
        schemaId?: number,
        xmlDocAndSchema?: any,
        CompleteByDate: string,
        WorkflowPerItem: boolean,
        VersionSourceType?: 'media' | 'version'
    }) {

        let postData = {
            "PresetId": param.preset.Id,
            "Notes": param.note,
            "CompleteByDate": param.CompleteByDate,
            "Media": param.items.map(item => {
                return {Id: item.ID, ItemType: item.basket_item_type};
            }),
            "SchemaId": param.schemaId,
            "XmlDocAndSchema": param.xmlDocAndSchema,
            "WorkflowPerItem": param.WorkflowPerItem,
            "VersionSourceType": param.VersionSourceType
        };

        return this.httpService
            .post(
                '/api/v3/mediaorder',
                JSON.stringify(postData, this.httpService.getCircularReplacer())
            )
            .pipe(map((res: any) => {
                return res.body;
            }, (err: HttpErrorResponse) => {
                return err;
            }));

    }

    clearBasket() {
        this.serverStorage.store('media.basket.data', {items:[]}).subscribe(() => {})
    }

    private setItems(items) {
        this._items.next(Object.assign({}, items).items);
    }
}
