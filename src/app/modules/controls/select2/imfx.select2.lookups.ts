/**
 * Created by Sergey Trizna on 29.09.2017.
 */
import { IMFXControlsSelect2Component } from "./imfx.select2";
import { ArrayProvider } from "../../../providers/common/array.provider";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation } from "@angular/core";
import { Select2ConvertObject, Select2ItemType, Select2ListTypes } from "./types";
import { TranslateService } from '@ngx-translate/core';
import { StringProivder } from "../../../providers/common/string.provider";
import { Router } from "@angular/router";
import { LookupReturnTypeForSelect2, LookupService } from "../../../services/lookup/lookup.service";
import { LookupsTypes } from "../../../services/system.config/search.types";
import { HttpService } from "../../../services/http/http.service";
import { Observable, ReplaySubject } from 'rxjs';

export type IMFXSelect2LookupReturnType = { res: any, select2Res: Select2ItemType[] } | {}

@Component({
    selector: 'imfx-lookups-select2',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        ArrayProvider
    ]
})
export class IMFXControlsLookupsSelect2Component extends IMFXControlsSelect2Component {
    public onReady: ReplaySubject<IMFXSelect2LookupReturnType> = new ReplaySubject<IMFXSelect2LookupReturnType>();
    @Input('lookupType') public lookupType: LookupsTypes;
    @Input('dbField') public dbField: string;
    @Input('lookupUrl') public lookupUrl: string = '/api/lookups/';
    @Input('lookupGetParams') public lookupGetParams: string = '';
    @Input('compContext') public compContext;
    @Input('readonly') protected readonly = false;
    @Input('fetchLookup') protected fetchLookup: boolean = true;
    @Input('filterResult') public filterResult = (lookups: any[], context: any, sourceData: any[] = null) => {
        return lookups;
    };

    protected _storageData: Select2ListTypes = [];
    // private disabled: boolean = false;
    private sourceData: any = [];

    constructor(public arrayProvider: ArrayProvider,
                public translate: TranslateService,
                public stringProvider: StringProivder,
                public router: Router,
                public lookupService: LookupService,
                public cdr: ChangeDetectorRef,
                public http: HttpService) {
        super(arrayProvider, translate, stringProvider, router, cdr, http);
    }

    public turnAndSetData(dirtyData: any[] = [], rules: Select2ConvertObject, selectedIds: string[] | number[] = []) {
        const data: Select2ItemType[] = this.turnArrayOfObjectToStandart(dirtyData, rules);
        this.setSourceData(dirtyData);
        this.setData(data);
        if (selectedIds.length > 0) {
            this.setSelectedByIds(selectedIds);
        }
    }

    setReadonly(v: boolean) {
        this.readonly = v;
        this.cdr.markForCheck();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit(false);
        if (this.lookupType && this.lookupType.length !== 0 && this.fetchLookup) {
            this.reloadData().subscribe((res: IMFXSelect2LookupReturnType) => {
                this.onReady.next(res);
                this.onReady.complete();
            });
        } else {
            this.onReady.next({});
            this.onReady.complete();
        }
    }

    reloadData(lookupType?): Observable<IMFXSelect2LookupReturnType> {
        return new Observable((observer) => {
            this.lookupService.getLookupForSelect2Controls(lookupType ? lookupType : this.lookupType, this.lookupUrl, this.lookupGetParams, this.compContext)
                .subscribe(
                    (res: LookupReturnTypeForSelect2) => {
                        this.setSourceData(res.sourceData);
                        let items: Select2ItemType[] = res.select2Items;
                        if(this.lookupUrl == "/api/lookups/")
                            items = this.turnObjectOfObjectToStandart(this.filterResult(res.select2Items, this.compContext, res.sourceData));

                        this.setData(items, true);
                        if (!this.disabled) {
                            this.enable();
                        }
                        observer.next({res: res.sourceData, select2Res: items});
                    },
                    (error: any) => {
                        console.error('Failed', error);
                        observer.error(error);
                    }, () => {
                        observer.complete();
                    }
                );
        });
    }

    setSourceData(data) {
        this.sourceData = data;
    }

    getSourceData() {
        return this.sourceData;
    }
}
