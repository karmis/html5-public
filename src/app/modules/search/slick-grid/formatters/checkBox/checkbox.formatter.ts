import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector, OnDestroy,
    ViewEncapsulation
} from "@angular/core";
import {
    SlickGridColumn,
    SlickGridFormatterData,
    SlickGridRowData,
    SlickGridTreeRowData
} from "../../types";
import { commonFormatter } from "../common.formatter";
import { SlickGridProvider } from '../../providers/slick.grid.provider';
import { ProductionDetailProvider } from '../../../../../views/detail/production/providers/production.detail.provider';
import { Subscription } from 'rxjs';


@Component({
    selector: 'checkbox-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CheckBoxFormatterComp implements OnDestroy {
    public injectedData: any;
    private params: SlickGridFormatterData;
    protected isActive: boolean = false;
    private provider: SlickGridProvider;
    protected setups: {
        isProduction: Boolean;
        enabled: boolean,
        enabledList: null[], // rows ID's
        messageTrue: null, // true/false message after checkbox if nessessary
        messageFalse: null,
        bitmask: null, //true if it's bitwise checkbox view
        bitIndex: null //bit index for check
        isActiveFn:Function, /*(SlickGridFormatterData, SlickGridProvider)*/
        getIdFn: Function /*(SlickGridFormatterData, SlickGridProvider)*/
    };
    subs: Subscription;

    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                private productionDetailProvider: ProductionDetailProvider) {
        this.injectedData = this.injector.get('data');
        this.provider = this.injectedData.data.columnDef.__contexts.provider;
        this.params = this.injectedData.data;
        this.setups = this.injectedData.data.columnDef.__deps.data;
    }

    ngOnInit() {
        if (this.setups && this.setups.isProduction) {
            this.subs = this.productionDetailProvider.updateSubsRowMakeItemsGrid.subscribe(status => {
                const id = this.injectedData.data.data.ID;
                const filed = id === 0 ? '__ID' : 'ID';
                const idItem = id === 0 ? this.injectedData.data.data.ITEM.__ID : id;
                const makeItem = this.productionDetailProvider.getItemById(idItem, filed)
                this.isActive = makeItem && makeItem.Subtitles.length !== 0;
                this.cdr.detectChanges();
            })
        }
    }

    ngAfterViewInit() {
        if ((this.params.data && this.params.value)) {
            this.isActive = parseInt(this.params.value) > 0 || this.params.value === 'true' || this.params.value === true;
        }

        const id = this.getId();

        if (id && this.setups && this.setups.enabledList && this.setups.enabledList.indexOf(id) > -1) {
            this.provider.addCheckedRows([id]);
            this.isActive = true;
        }

        if(this.setups && this.setups.bitmask && this.setups.bitIndex !== null && this.params.value) {
            // @ts-ignore
            this.isActive = (this.params.value & (1 << this.setups.bitIndex)) != 0;
        }


        if(this.setups && this.setups.isActiveFn) {
            this.isActive = this.setups.isActiveFn(this.params.data, this.provider)
        }

        // if ((this.params.data && this.params.value)) {
        //     this.isActive = this.params.value === 1 || this.params.value === 'true' ? true : false;
        // } else if (this.params.data.__checked === true) {
        //     this.isActive = true;
        // } else if (this.params.data.Id && this.setups.enabledList.indexOf((<any>this.params.data).Id) > -1) {
        //     this.params.data.__checked = true;
        //     this.isActive = true;
        // }
        if(this.isActive) {
            this.cdr.detectChanges();
        }
    }

    ngOnDestroy() {
        if (this.subs) {
            this.subs.unsubscribe();
        }
    }

//formatterCheckBoxOnChange
    onChange($event) {
        if(this.provider) {
            // console.log('checkbox-formatter OnChange');
            // const id = Number(this.params.data.ID != null ? this.params.data.ID : this.params.data.id);
            const id = this.getId();
            if ($event.target.checked) {
                this.provider.addCheckedRows([id]);
            } else {
                this.provider.removeCheckedRows([id]);
            }
        }
        if(this.params.columnDef.__contexts.provider)
            this.params.columnDef.__contexts.provider.formatterCheckBoxOnChange.emit({
                data: this.params,
                value: $event.target.checked
            });
    }

    private getId() {
        const _id = (this.setups&&this.setups.getIdFn)?this.setups.getIdFn(this.params.data, this.provider):null;
        return _id != null ? _id : this.params.data.Id;
    }
}

export function CheckBoxFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(CheckBoxFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



