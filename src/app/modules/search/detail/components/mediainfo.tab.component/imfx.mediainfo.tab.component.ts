import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Injectable,
    Input,
    Output,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from "@angular/core";
import {IMFXControlsLookupsSelect2Component} from "../../../../controls/select2/imfx.select2.lookups";
import {Subject} from "rxjs";
import { CustomStatusControlComponent } from './comps/custom.status/custom.status.control.component';
import { takeUntil } from 'rxjs/operators';
import { Select2EventType } from 'app/modules/controls/select2/imfx.select2';
export type DetailMediaInfoType = {
    AGE_CERTIFICATION?: number,
    AGE_CERTIFICATION_text?: string,
    TV_STD?: number,
    TV_STD_text?: string,
    ASPECT_R_ID?: number,
    ASPECT_R_ID_text?: string,
    USAGE_TYPE?: number,
    USAGE_TYPE_text?: string
    AFD_ID?: number,
    AFD_ID_text?: string,
    ITEM_TYPE?: number,
    ITEM_TYPE_text?: string,
    DESCRIPTION?: string,
    M_CTNR_FMT_ID?: number //M_CTNR_FMT_ID
    MEDIA_FORMAT_text?: string
    AUD_LANGUAGE_ID?: number
    AUD_LANGUAGE_ID_text?: string
    ASSUBSTYPE?: number
    ASSUBSTYPE_text?: string
}
// export const DetailMediaInfoColumns = {
//     AGE_CERTIFICATION: 'Certification',
//     TV_STD: 'TvStandard',
//     ASPECT_R_ID: 'AspectRatio',
//     USAGE_TYPE: 'Usage',
//     AFD_ID: 'AFD',
//     ITEM_TYPE: 'ItemType',
//     MEDIA_FORMAT: 'MediaFormat',
//     AUD_LANGUAGE_ID: 'Language',
//     ASSUBSTYPE: 'ClosedCaptions'
// }
@Component({
    selector: 'imfx-media-info-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
@Injectable()
export class IMFXMediaInfoComponent {
    @ViewChildren('commonColumnControl') public commonColumnControlList: QueryList<IMFXControlsLookupsSelect2Component>;
    @ViewChildren('customStatusControl') public customStatusControlList: QueryList<CustomStatusControlComponent>;
    @ViewChild('control_DESCRIPTION', {static: false}) control_DESCRIPTION: ElementRef;
    control_AFD_ID: IMFXControlsLookupsSelect2Component;
    @Input() onRefresh: Subject<any> = new Subject();
    @Output() onDataChanged: EventEmitter<any> = new EventEmitter();
    @Output() isDataValid: EventEmitter<any> = new EventEmitter();
    config: any;
    readOnly: boolean = false;
    mediaInfoValidationEnabled: boolean = false;
    customStatusValidationEnabled: boolean = true;
    private model: DetailMediaInfoType;
    protected customStatuses = [];
    customMediaStatusSettings: any = [];
    customMediaStatusLookups: any = [];
    columnsSettings: {
        Columns: {
            Id: string,
            Label: string,
            Readonly: boolean,
            Visible: boolean
        }[],
        ReadOnly: boolean
    } | boolean = true; // true || Columns==null - show all general cols; null/false - hide all; obj - show cols according settings;
    // showCommonInfo: boolean = true;
    isReady: boolean = false;
    afdIcon = null;
    initFilter = (lookups: any[], context: any) => {
        return lookups;
    };

    showDescription = false;
    filteredCommonCols = [];
    defaultColumns = [
        {
            "id": "MediaFormat",
            "field": "M_CTNR_FMT_ID",
            "lookupType": "MediaFileTypes",
            "label": "mediatype",
            "fieldText": "MEDIA_FORMAT_text",
            "filterResult": this.initFilter,
            "ReadOnly": false
        },
        {
            "id": "TvStandard",
            "field": "TV_STD",
            "lookupType": "TvStandards",
            "label": "tvstandart",
            "fieldText": "TV_STD_text",
            "filterResult": this.initFilter,
            "ReadOnly": false
        },
        {
            "id": "Usage",
            "field": "USAGE_TYPE",
            "lookupType": "UsageTypes",
            "label": "usage",
            "fieldText": "USAGE_TYPE_text",
            "filterResult": this.initFilter,
            "ReadOnly": false
        },
        {
            "id": "AspectRatio",
            "field": "ASPECT_R_ID",
            "lookupType": "AspectRatioTypes",
            "label": "aspectratio",
            "fieldText": "ASPECT_R_ID_text",
            "filterResult": this.initFilter,
            "ReadOnly": false
        },
        {
            "id": "Certification",
            "field": "AGE_CERTIFICATION",
            "lookupType": "AgeCertification",
            "label": "certification",
            "fieldText": "AGE_CERTIFICATION_text",
            "filterResult": this.initFilter,
            "ReadOnly": false
        },
        {
            "id": "ItemType",
            "field": "ITEM_TYPE",
            "lookupType": "ItemTypes",
            "label": "itemtype",
            "fieldText": "ITEM_TYPE_text",
            "filterResult": this.initFilter,
            "ReadOnly": false
        },
        {
            "id": "AFD",
            "field": "AFD_ID",
            "lookupType": "AfdTypes",
            "label": "afd",
            "fieldText": "AFD_ID_text",
            "filterResult": this.initFilter,
            "ReadOnly": false
        },
        {
            "id": "ClosedCaptions",
            "field": "ASSUBSTYPE",
            "lookupType": "AssessmentSubsTypes",
            "label": "captions",
            "fieldText": "ASSUBSTYPE_text",
            "filterResult": this.initFilter,
            "ReadOnly": false
        },
        {
            "id": "Language",
            "field": "AUD_LANGUAGE_ID",
            "lookupType": "Languages",
            "label": "language",
            "fieldText": "AUD_LANGUAGE_ID_text",
            "filterResult": this.initFilter,
            "ReadOnly": false
        }
    ];//todo immutable

    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef) {
        this.onRefresh.pipe(
            takeUntil(this.destroyed$)
        ).subscribe(data => {
            this.refresh(data.file, data.readOnly);
        });
    }

    ngOnInit() {
        this.calcDisplayCommonColumns();
        const customMediaStatusTypes = JSON.parse(window.sessionStorage.getItem('tmd.lookups.CustomMediaStatusTypes')) || [];
        this.customStatuses = (Array.isArray(this.customMediaStatusSettings))
            ? this.customMediaStatusSettings.map(el => {
                const cms = customMediaStatusTypes.find(_el => (_el.ID - 0) === (el.MediaStatusId - 0));
                return {...el, isMultiSelect: cms && cms.IsMultiSelect || false}
            })
            : [];

        let self = this;
        // if (this.commonMediaInfoDisplay()) {
            this.model = this.fillModel(this.config);
            this.cdr.markForCheck();
        // }

        // this.afdTypesFilter = (lookups: any[], context: any) => {
        const afdCol = this.getCommonCol('AFD_ID');

        if (!afdCol) {
            return;
        }
        afdCol.filterResult = (lookups: any[], context: any, sourceData) => {
            if(self.model) {
                var ratio = self.model['ASPECT_R_ID'];
                if(ratio >= 0) {
                    let map = {};
                    sourceData.forEach(item => {
                            map[item.ID] = item;
                        }
                    )
                    return lookups.filter((val) => {
                        return map[val.id].AspectRatioId == ratio
                    });
                }
            }
            return lookups;
        };
    }

    ngAfterViewInit() {
        this.isReady = true;
        Promise.resolve()
            .then(
            () => {
                if (this.destroyed$.isStopped) {
                    return;
                }
                // if (this.commonMediaInfoDisplay()) {
                    //this.model = this.fillModel(this.config);
                    this.fillForm(this.model , true);
                // }
                this.isDataValid.emit(this.getValidation());

                // this.fillStatusLookups();
            },
        (err) => {
                console.log(err);
            }
        );
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    calcDisplayCommonColumns(): void {
        if (!this.columnsSettings){ //show nothing
            return;
        }

        if (this.columnsSettings === true || !this.columnsSettings.Columns){ //show all and descr
            this.filteredCommonCols = this.defaultColumns;
            this.showDescription = true;
            return;
        }

        const columns = this.columnsSettings.Columns;

        if (!columns || !Array.isArray(columns)) {
            return;
        }

        this.filteredCommonCols = this.defaultColumns.filter(el => {
            const col = columns.find(_el => _el.Id === el.id && _el.Visible);
            if (!col) {
                return false;
            }
            // todo exclude dirty
            el.ReadOnly = col.Readonly;
            return true;
        });
    }

    getCommonCol(field) {
        const col = this.filteredCommonCols.find(el => el.field == field);
        return col;
    }

    commonMediaInfoDisplay() {
        // return this.showCommonInfo;

        return !!this.columnsSettings;
    }

    onUpdateControl($event: Select2EventType, field) {
        const comp = $event.params.context;
        const col = this.getCommonCol(field);

        this.model[field] = comp.getSelected();
        this.model[col.fieldText] = comp.getSelectedText()[0];
        comp.checkValidation(this.model[field]);
        this.fillAFD(field);
        this.save();
        this.onDataChanged.emit();
        this.isDataValid.emit(this.getValidation());
    }

    onChangeNotes($event) {
        this.model.DESCRIPTION = $.trim(this.control_DESCRIPTION.nativeElement.value);
        this.onDataChanged.emit();
        this.save();
    }

    refresh(config, readOnly?: boolean) {
        if (readOnly != null) {
            this.readOnly = readOnly;
            this.mediaInfoValidationEnabled = false; // this.readOnly;   for Weigel
        }
        this.config = config;
        this.cdr.detectChanges();
        // if (this.commonMediaInfoDisplay()) {
            this.model = this.fillModel(this.config);
            this.fillForm(this.model);
        // }
        this.isDataValid.emit(this.getValidation());
    }

    fillForm(model: DetailMediaInfoType, firstInit: boolean = false) {
        let isValid = true;

        // forEach(fn: (item: T, index: number, array: T[]) => void)
        this.commonColumnControlList.forEach((comp, i) => {
            const col = this.filteredCommonCols[i];
            const field = col.field;
            let _readonly = (col.hasOwnProperty('ReadOnly'))
                ? (col.ReadOnly||this.readOnly)
                : this.readOnly;

            comp.onReady.pipe(
                takeUntil(this.destroyed$)
            ).subscribe(() => {
                comp.setSelectedByIds([model[field]]);

                comp.setDisabled(_readonly);
                this.fillAFD(field, firstInit);
                isValid = isValid && comp.getValidation();
                this.isDataValid.emit(isValid);
            });
            comp.setSelectedByIds([model[field]]);

            comp.setDisabled(_readonly);
            comp.refresh();

            //remember AFD_ID select2comp
            if(col.field == 'AFD_ID') {
                this.control_AFD_ID = comp;
            }
            this.fillAFD(field, firstInit);
        });

        if (this.showDescription) {
            $((this.control_DESCRIPTION).nativeElement).text(model['DESCRIPTION']);
        }

        this.isDataValid.emit(this.getValidation());
    }

    fillModel(config): DetailMediaInfoType {
        let m: DetailMediaInfoType = {};

        this.filteredCommonCols.forEach(el => {
            m[el.field] = config[el.field];
            m[el.fieldText] = config[el.fieldText];
        })

        if (this.showDescription) {
            m.DESCRIPTION = config.DESCRIPTION;
        }

        return m;
    }

    getValidation() {
        let isValid = true;
        if (this.readOnly) {
            if (this.customStatusValidationEnabled) {
                // checking validation custom statuses
                let csArr = this.customStatusControlList.toArray();
                for (let i=0; i < csArr.length; i++) {
                    csArr[i].checkValidation();
                }
            }
            return isValid;
        }
        if (this.mediaInfoValidationEnabled) {
            this.commonColumnControlList.forEach((comp, i) => {
                isValid = comp.getValidation();
                if (!isValid) {
                    return false;
                }
            });

            // if (v == 'DESCRIPTION') {
            //
            // }
        }

        if (this.customStatusValidationEnabled) {
            // checking custom statuses
            let csArr = this.customStatusControlList.toArray();
            for (let i=0; i < csArr.length; i++) {
                isValid = csArr[i].checkValidation();
                if (!isValid) {
                    return false;
                }
            }
        }

        return isValid;
    }

    // public callValidation() {
    //     this.isDataValid.emit(this.getValidation());
    // }

    // saveField() {
    //
    // }

    save() {
        const m = this.model;
        const c = this.config;
        this.filteredCommonCols.forEach(el => {
            c[el.field] = m[el.field];
            c[el.fieldText] = m[el.fieldText];
        });

        if (this.showDescription) {
            c.DESCRIPTION = m.DESCRIPTION;
        }

        return c;
    }

    getLookupBySettings(id) {
        if (!Array.isArray(this.customMediaStatusLookups)) {
            return null;
        }
        return this.customMediaStatusLookups.find(e => e.Id == id);
    }

    getValueBySettings(id) {
        let mediaItemVals = this.config.CustomStatuses;
        if (!Array.isArray(mediaItemVals)) {
            return null;
        }

        let valObj = mediaItemVals.find(el => el.TypeId == id);
        return valObj ? valObj : null;
    }

    setValueByValObj(valObj) {
        let mediaItemVals = this.config.CustomStatuses;
        if (!Array.isArray(mediaItemVals)) {
            this.config.CustomStatuses = [];
            mediaItemVals = this.config.CustomStatuses;
        }

        let cuStatVal = this.getValueBySettings(valObj.TypeId);

        if (cuStatVal) {
            cuStatVal.Values = valObj.Values;
        } else {
            mediaItemVals.push({
                TypeId: valObj.TypeId,
                Values: valObj.Values
            });
        }
    }

    onUpdateStatValue($event) {
        if (!this.isReady || !$event || !$event.TypeId) {
            return;
        }

        this.setValueByValObj($event);

        this.onDataChanged.emit();
        this.isDataValid.emit(this.getValidation());
    }

    private fillAFD(v, firstInit = false) {
        const comp = this.control_AFD_ID;

        if(!comp) {
            return;
        }

        if (v == 'ASPECT_R_ID' && !firstInit) {
            let sourceData = comp.getSourceData();
            let afd = sourceData.filter((el) => { return el.ID == this.model['AFD_ID']; });
            if(afd[0] && afd[0].AspectRatioId != this.model['ASPECT_R_ID'] && this.model['ASPECT_R_ID'] != -1) {
                this.model['AFD_ID'] = null;
                comp.clearSelect();
            }
            comp.reloadData().subscribe((res: any) =>{
                if(this.model['AFD_ID'] != null) {
                    comp.setSelected([this.model['AFD_ID']]);
                    this.cdr.markForCheck();
                }
            });
        }
        else if (v == 'AFD_ID') {
            let sourceData = comp.getSourceData();
            let afd = sourceData.filter((el) => { return el.ID == this.model[v]; })[0];
            if (afd) {
                this.afdIcon = afd.Image;
            }
            else {
                this.afdIcon = null;
            }
        }
        this.cdr.markForCheck();
    }
}
