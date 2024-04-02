import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import { commonFormatter } from '../common.formatter';
import { Select2ConvertObject, Select2ItemType } from '../../../../controls/select2/types';
import { LookupService } from '../../../../../services/lookup/lookup.service';
import { SessionStorageService } from "ngx-webstorage";


@Component({
    selector: 'pgm-media-status-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None
})
export class PgmMediaStatusFormatterComp {
    public params;
    public injectedData: SlickGridFormatterData;
    public textValue;
    public lookupValueField;
    public lookupValue;
    public storageKey;
    public lookups;
    public backColour;
    public colour;
    constructor(private injector: Injector,
                private sessionStorage: SessionStorageService) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;

        this.textValue = this.params.value;
        this.lookupValueField = this.params.columnDef.__deps.data.lookupValueField;
        this.storageKey = this.params.columnDef.__deps.data.storageKey;
        this.lookupValue = this.params.data[this.lookupValueField];

        this.lookups = this.sessionStorage.retrieve('lookups.' + this.storageKey);

        if(this.lookups) {
            this.backColour = this.defineBackColour(this.lookups);
            this.colour = this.defineColour(this.lookups);
        }
        // else {
        //     this.initLookups((lookups) => {
        //         this.lookups = lookups;
        //         this.backColour = this.defineBackColour(lookups);
        //         this.colour = this.defineColour(lookups);
        //     });
        // }

    }

    defineBackColour(arrLookups) {
        const lookup = arrLookups.find(el => el.ID == this.lookupValue);
        return (lookup && lookup.BackColour)
            ? lookup.BackColour
            : null;
    }

    defineColour(arrLookups) {
        const lookup = arrLookups.find(el => el.ID == this.lookupValue);
        return (!lookup || lookup.Colour === null)
            ? null
            : (lookup.Colour)
                ? lookup.Colour
                : '#000000';
    }

    // initLookups(callback: (lookups) => void) {
    //     this.lookupService.getLookups(this.storageKey, '/api/lookups/')
    //         .subscribe(
    //             (lookups: any) => {
    //                 callback(lookups);
    //                 // this.sessionStorage.store('lookups.' + this.storageKey, lookups);
    //             },
    //             (error: any) => {
    //                 console.error('Failed', error);
    //             }, () => {
    //             }
    //         );
    // }

    ngAfterViewInit(){
        // console.log(this.storageKey, 'PgmMediaStatusFormatterComp', this);

    }
}

export function PgmMediaStatusFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(PgmMediaStatusFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



