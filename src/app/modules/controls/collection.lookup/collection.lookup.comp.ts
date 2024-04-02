import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    QueryList,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { IMFXControlsLookupsSelect2Component } from '../select2/imfx.select2.lookups';
import { Select2ConvertObject, Select2ItemType } from '../select2/types';
import { Select2EventType } from '../select2/imfx.select2';
import { forkJoin, Observable } from 'rxjs';
import {
    CollectionLookupOnUpdate,
    CollectionLookupsComp, CollectionLookupsReturnListType,
    CollectionLookupsReturnType
} from '../collection.lookups/collection.lookups.comp';

export type CollectionLookupData = { [key: string]: string[] | number[] };/*{ [key: string]: Select2ItemType[] }*/
export type CollectionLookupOnAddRemove = { type: CollectionLookupChangeType, field: string };
export type CollectionLookupChangeType = 'add' | 'remove' | 'change';

@Component({
    selector: 'collection-lookup',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CollectionLookupComp extends IMFXControlsLookupsSelect2Component {
    public self: CollectionLookupComp | CollectionLookupsComp = this;
    @ViewChildren('controls') public controls: QueryList<IMFXControlsLookupsSelect2Component>;
    @Input('titleColWidth') titleColWidth: string;
    @Input('controlColWidth') controlColWidth: string;
    @Input('title') title: string;
    @Input('minLimit') minLimit: number = 1;
    @Input('maxLimit') maxLimit: number = 10;
    @Input('idField') idField: string = '';
    @Input('compareObject') compareObject: Select2ConvertObject = {key: 'ID', text: 'Name'};

    @Output() onUpdateControl: EventEmitter<CollectionLookupOnUpdate> = new EventEmitter<CollectionLookupOnUpdate>();
    @Output() onUpdateStructure: EventEmitter<CollectionLookupOnAddRemove> = new EventEmitter<CollectionLookupOnAddRemove>();
    protected _countCollection: string[] = ['0'];

    @Input('readonly') protected readonly: boolean = false;

    @Input('count') set count(c: number | null) {
        if (c === null) {
            return;
        }
        this.setCount(c).subscribe(() => {
            // on ready ...
        });
    }

    private _data: Select2ItemType[] = [];

    get data(): Select2ItemType[] {
        return this._data;
    }

    set data(value: Select2ItemType[]) {
        this._data = value;
    }

    protected _lastChanged: CollectionLookupOnUpdate = null;

    get lastChanged(): CollectionLookupOnUpdate {
        return this._lastChanged;
    }

    setReadonly(v: boolean) {
        super.setReadonly(v);
        this.readonly = v;
        this.cdr.markForCheck();
    }

    setValues(values: CollectionLookupData = {}, data: Select2ItemType[] = []) { // {0: [{id: '1', text: '123'}, 1: {id: '1', text: '123'}]}
        const count: number = Object.keys(values).length;
        const obs = this.setCount(count).subscribe(() => {
            this.updateControls(values, data);
            if (obs && obs.unsubscribe) {
                obs.unsubscribe();
            }
        });
    }

    updateControls(values: CollectionLookupData = {}, data: Select2ItemType[]= []): void {
        this.controls.forEach((control: IMFXControlsLookupsSelect2Component, i: number) => {
            // const i = _i - 1;
            if (i > 0) {
                const v = values[i - 1];
                const ids = Array.isArray(v) ? v : [v];
                if (control.getData().length === 0 && data.length > 0) {
                    control.setData(data, true);
                }
                if (v != undefined && ids.length > 0) {
                    control.clearSelected();
                    control.setSelectedByIds(ids, false);
                }

                if (this.readonly === false) {
                    control.setDisabled(false);
                } else {
                    control.setDisabled(true);
                }
            }
        });
    }

    getValues(): CollectionLookupsReturnListType {
        const res: CollectionLookupsReturnListType = {};
        this.controls.forEach((control: IMFXControlsLookupsSelect2Component, i: number) => {
            if (i > 0) { // skip the first (fake) control
                const v = {};
                if (v[i] == null) {
                    v[i] = [control.getSelectedId()]
                }
                res[i] = {
                    items: control.getSelectedObjects(),
                    structItem: {
                        lookupType: this.lookupType,
                        lookupUrl: this.lookupUrl,
                        idField: this.idField,
                        values: v,
                        compareObject: this.compareObject,
                    },
                    control: control,
                    x: 0,
                    y: i,
                    i: i
                };
            }
        });

        return res;
    }

    setCount(c: number = null, n: string | number = null): Observable<string> {
        return new Observable((observer) => {
            let type: CollectionLookupChangeType = 'add';
            if (c > this.maxLimit || c < this.minLimit) {
                return;
            }
            if (!this._countCollection || (this._countCollection.length - 1) === 0 || c >= this._countCollection.length) {
                let diff = c - (this._countCollection.length); // + 1 invisible
                while (diff >= 0) {
                    this._countCollection.push((this._countCollection.length + 1).toString());
                    diff = diff - 1;
                }
                type = 'add';
            } else if (c < this._countCollection.length) {
                let preCollection = this._countCollection;
                preCollection.forEach((uid: string, i) => {
                    if (uid === n) {
                        preCollection = preCollection.splice(preCollection.indexOf(n), 1);
                        this.controls.filter((control: IMFXControlsLookupsSelect2Component) => {
                            return control.uid != n;
                        });
                        $('collection-lookup imfx-lookups-select2 > .select2-wrapper[data-uid="' + uid + '"]')
                            .parents('tr')
                            .remove();
                    }
                });
                type = 'remove';
            }

            // this.onUpdateStructure.emit({type: type, field: this.idField});
            // observer.next(type as CollectionLookupChangeType);
            // observer.complete();

            if (type === 'remove') {
                // this.onUpdateStructure.emit({type: type, field: this.idField});
                this._lastChanged = {
                    $event: null,
                    idField: this.idField,
                    values: [],
                    type: type,
                    i: null
                };

                observer.next(type as CollectionLookupChangeType);
                observer.complete();
                this.cdr.detectChanges();
                this.onUpdateControl.emit(this.lastChanged);
                return;
            } else {
                this.cdr.detectChanges(); // necessary
                // setTimeout(() => {
                const observables = [];
                this.controls.forEach((control: IMFXControlsLookupsSelect2Component) => {
                    observables.push(control.onReady);
                });

                forkJoin(observables).subscribe(() => {
                    this.updateControls({}, this.data);
                    this.onUpdateStructure.emit({type: type, field: this.idField});
                    observer.next(type as CollectionLookupChangeType);
                    observer.complete();
                    //
                    this._isValid(type);
                    this.cdr.detectChanges();
                });
                // }, 300);
            }


            // new Promise((r) => {
            //     r()
            // }).then(() => {
            // const observables = [];
            // this.controls.forEach((control: IMFXControlsLookupsSelect2Component) => {
            //     observables.push(control.onReady);
            // });
            //
            // forkJoin(observables).subscribe(() => {
            //     this.controls.forEach((control: IMFXControlsLookupsSelect2Component) => {
            //         if (control.getData().length === 0 && this.data.length > 0) {
            //             control.setData(this.data, true);
            //         }
            //     });
            //     this.onUpdateStructure.emit({type: type, field: this.idField});
            //     observer.next(type);
            //     observer.complete();
            //
            //     this.cdr.detectChanges();
            //     this._isValid(type);
            // });
            // });
        })
    }

    _isValid(type: CollectionLookupChangeType): boolean {
        if (this.validationEnabled == false) {
            return true;
        }
        const res: number[] = [];
        if (this.controls && this.controls.length > 0 && type !== 'remove') {
            this.controls.forEach((control: IMFXControlsLookupsSelect2Component, i) => {
                if (control.getSelectedId() == null) {
                    res.push(i);
                    return;
                }
            });
        }
        this.isValid = !res.length;
        return this.isValid;
    }

    _onUpdateControl($event: Select2EventType, index: number = null) {
        this._isValid('change');
        this._lastChanged = {
            $event: $event,
            idField: this.idField,
            values: $event.params.context.getSelectedObjects(),
            type: 'change',
            i: index
        };
        this.onUpdateControl.emit(this.lastChanged);
    }

    singleFillCollection(dirtyData: any[], comp: Select2ConvertObject, dirtyVal: any[] = [], idField: string = null) {
        const selected: CollectionLookupData = {};
        this.data = this.turnArrayOfObjectToStandart(dirtyData, comp);
        this.setSourceData(dirtyData);
        if (dirtyVal != null && dirtyVal.forEach) {
            (dirtyVal || []).forEach((item: any, k) => {
                if (idField != null) {
                    selected[k] = [item[idField]]
                } else {
                    selected[k] = item
                }
            });
        }
        this.setValues(selected, this.data);
    }

    private _setCount(c: number = null, n: string | number = null) {
        if (this.readonly) {
            return;
        }
        this.setCount(c, n as string).subscribe((type: CollectionLookupChangeType) => {
            this.isValid = this._isValid(type);
        });
    }
}
