/**
 * Created by initr on 03.11.2016.
 */

import {Component, Input, ViewEncapsulation, Output, EventEmitter, Injector, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {LookupService} from "../../../../../services/lookup/lookup.service";
import {Observable,  Subject, Subscription } from "rxjs";
import { TranslateService } from '@ngx-translate/core';
import { appRouter } from '../../../../../constants/appRouter';
import * as Cookies from 'js-cookie';
import {AdvancedSearchModel} from "../../../../../models/search/common/advanced.search";
import {SearchModel} from "../../../../../models/search/common/search";
import { takeUntil } from 'rxjs/operators';
import { SessionStorageService } from "ngx-webstorage";
import {SlickGridService} from "../../../slick-grid/services/slick.grid.service";
import { SlickGridProvider } from '../../../slick-grid/providers/slick.grid.provider';

@Component({
  selector: 'accordion-block',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None
})
export class IMFXAccordionComponent {
    @Input() file: Object;
    @Input() groups: any = [];
    @Input() friendlyNames: Object;
    @Input() lookup: string;
    @Input() columnData: Object = {};
    public datetimeFullFormatLocaldatePipe: string = 'DD/MM/YYYY HH:mm';
    @Output() contentReadyEvent: EventEmitter<any> = new EventEmitter();
    @Input() onRefresh: Subject<any> = new Subject();
    @Input() parentSlickgridProvider: SlickGridProvider = null;
    @Input() specifiedEndpointUrl: string = null;
    private _open: true;
    private destroyed$: Subject<any> = new Subject();
    private statusConfig = {
        value: null
    };
    private params = {
        showAllProperties: false
    };
    private showComponent: boolean = false;
    private showDynamicFieldsOverlay: boolean = false;
    private linkProps = {
        'VERSION' : {
            linkTemp: appRouter.versions.detail,
            valueField: 'PGM_PARENT_ID'
        },
        'SER_TITLE' : {
            linkTemp: appRouter.title.detail,
            valueField: 'SER_ABS_ID'
        },
        'SER_NAME' : {
            linkTemp: appRouter.title.detail,
            valueField: 'SER_ABS2_ID'
        },
        'TITLE' : {
            linkTemp: appRouter.title.detail,
            valueField: 'PGM_ABS_ID'
        },
    };

    private lookupsColors = {};

    constructor(private route: ActivatedRoute,
                private router: Router,
                public injector: Injector,
                private translate: TranslateService,
                private sessionStorage: SessionStorageService,
                private lookupService: LookupService,
                public cd: ChangeDetectorRef) {
        this._open = true;
        this.translate.get('common.date_time_full_format_localdate_pipe').subscribe(
            (res: string) => {
                this.datetimeFullFormatLocaldatePipe = res;
            });
        this.onRefresh.pipe(
            takeUntil(this.destroyed$)
        ).subscribe(data => {
            this.refresh(data);
        });

    }

    ngOnInit() {
        this.showDynamicFieldsOverlay = false;
        if (this.groups.length == 0) {
            this.groups = this.setDetailColumtnsGroups(this.columnData);
        }
        if (!this.friendlyNames) {
            this.loadFriendlyName(this.lookup).pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                    this.showComponent = true;
                    this.cd.detectChanges();
                });
        } else {
            this.showComponent = true;
            this.cd.detectChanges();
        }
        if (this.parentSlickgridProvider) {
            this.showDynamicFieldsOverlay = true;
            this.getDynamicFieldsFromRest();
        }
        if (!this.file) { return; }
        this.statusConfig.value = this.file['Status_text'];
        this.prepareLinks();
        this.initColorsForStatuses('PgmStatus', 'pgm_status_text');
        this.initColorsForStatuses('MediaStatus', 'media_status_text');
    }

    //temporary fix for px-4199.
    ngOnChanges(simpleChangesObj) {
        if (simpleChangesObj.lookup && !simpleChangesObj.lookup.firstChange) {
        // if (simpleChangesObj.columns) {
            this.loadFriendlyName(this.lookup).pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                // this.showComponent = true;
                this.cd.detectChanges();
            });

            // this.fields = this.columns.filter(e => this.arr[this.arr.indexOf(e.id.toLowerCase())]);
        }
    }

    ngAfterViewInit() {
        this.afterContentLoaded();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    getDynamicFieldsFromRest () {
        let extendedFields = [];
        let dynamicCols = this.parentSlickgridProvider.getGlobalColumns().filter(el=>{return el.field.indexOf('Dynamic')>-1});
        dynamicCols.forEach(el => {
            if ( !(<any>this.file).DynamicFields[el.field] ) {
                extendedFields.push(el.field);
            }
        });
        const searchType = this.parentSlickgridProvider.config
            && this.parentSlickgridProvider.config.options
            && this.parentSlickgridProvider.config.options.searchType
            || 'media';
        let searchModel: SearchModel = new SearchModel();
        let asm_id = new AdvancedSearchModel();
        asm_id.setDBField('ID');
        asm_id.setField('Id');
        asm_id.setOperation('=');
        asm_id.setValue((<any>this.file).ID);
        searchModel.addAdvancedItem(asm_id);
        let sgs = this.injector.get(SlickGridService);

        let url = (this.specifiedEndpointUrl)
            ? this.prepareSpecifiedEndpointUrl(this.file)
            : null;

        sgs.search(
            searchType,
            searchModel,
            1,
            null,
            null,
            url,
            extendedFields
        ).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            this.showDynamicFieldsOverlay = false;
            if (res.Data.length) {
                (<any>this.file).DynamicFields = res.Data[0].DynamicFields;
                this.cd.detectChanges();
            }
        }, error => {
            this.showDynamicFieldsOverlay = false;
        });
    }

    prepareSpecifiedEndpointUrl(file) {
        if (!file) {
            return null;
        }

        let url = null;
        //toDo regexp instead of KocTbIJIb
        const bL = this.specifiedEndpointUrl.indexOf('{'),
            eL = this.specifiedEndpointUrl.indexOf('}');

        const field = this.specifiedEndpointUrl.substring(bL + 1, eL);
        const fieldValue = file[field];
        url = this.specifiedEndpointUrl.replace('{' + field + '}', fieldValue);

        return url;
    }

    prepareLinks() {

        for (let key in this.linkProps) {
            if (this.file[this.linkProps[key].valueField]) {
                this.linkProps[key].link = '/' + this.linkProps[key].linkTemp.replace(':id', this.file[this.linkProps[key].valueField]);
            }
        }


        // let linkObj = this.linkProps;
        // let linkStr;
        // if (linkObj && this.file[linkObj.valueField]) {
        //     linkStr = linkObj.link.replace(':id', this.file[linkObj.valueField]);
        // } else {
        //     return false;
        // }

        // this.router.navigate([linkStr]);
    }

    initColorsForStatuses(storageKey, fieldKey) {
        let lookups = this.sessionStorage.retrieve('lookups.' + storageKey);

        if(lookups) {
            this.lookupsColors[fieldKey] = lookups;
        } else {
            this.initColorsForStatusesFromServer(storageKey, (lookups) => {
                this.lookupsColors[fieldKey] =  lookups;
            });
        }
    }

    initColorsForStatusesFromServer(storageKey, callback: (lookups) => void) {
        this.lookupService.getLookups(storageKey, '/api/lookups/')
            .subscribe(
                (lookups: any) => {
                    callback(lookups);
                    // this.sessionStorage.store('lookups.' + this.storageKey, lookups);
                },
                (error: any) => {
                    console.error('Failed', error);
                }, () => {
                }
            );
    }

    defineOverrideBackColour(field, value) {
        const lookupsColors = this.lookupsColors[field.toLowerCase()];

        if (!Array.isArray(lookupsColors)) {
            return null;
        }

        const lookup = lookupsColors.find(el => el.Name == value);
        return (lookup && lookup.BackColour)
            ? lookup.BackColour
            : null;
    }

    defineOverrideColour(field, value) {
        const lookupsColors = this.lookupsColors[field.toLowerCase()];

        if (!Array.isArray(lookupsColors)) {
            return null;
        }

        const lookup = lookupsColors.find(el => el.Name == value);
        return (!lookup || lookup.Colour === null)
            ? null
            : (lookup.Colour)
                ? lookup.Colour
                : '#000000';
    }

    afterContentLoaded() {
      var self = this;
      setTimeout(function(){self.contentReadyEvent.emit(),0});
    }

    /*
    *Show/Hide empty properties
    */
    clickShowAllProperties($event) {
        $event.stopPropagation();
        $event.preventDefault();
        this.params.showAllProperties = !this.params.showAllProperties;
    }
    getTypeOf(prop, colid) {
        if (colid.indexOf('Dynamic') > -1) {
            if (this.file['DynamicFields'] === undefined) {
                return 'null';
            }
            return typeof this.file['DynamicFields'][colid];
        }
        if(prop === null) {
            return "null";
        }
        if(Array.isArray(prop)) {
            return "array";
        }
        return typeof prop;
    }

    isEmpty(data) {
        if (data === '' || data === undefined || data === null) {
            return true;
        }
        return false;
    }

    refresh(file, columnData?) {
        if (columnData) {
            this.columnData = columnData;
        }
        this.groups = this.setDetailColumtnsGroups(this.columnData);
        this.file = file;
        if (this.parentSlickgridProvider) {
            this.showDynamicFieldsOverlay = true;
            this.getDynamicFieldsFromRest();
        }
        this.prepareLinks();
        try {
            this.cd.detectChanges();
        } catch (e) {
            console.error(e);
        }
    }
    loadFriendlyName(lookup): Observable<Subscription> {
        return new Observable((observer: any) => {
            let service = this.injector.get(LookupService);
            service.getLookups(lookup).pipe(
                takeUntil(this.destroyed$)
            ).subscribe(
                (resp) => {
                    this.friendlyNames = resp;
                    return observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                }
            );
        });
    };

    setDetailColumtnsGroups(columnData) {
        return columnData ? columnData : [];
    };
    objectExist(obj) {
        return Object.keys(obj).length !== 0;
    }

    checkCol(col) {
        if (!this.file) {
            return false;
        }
        let file = this.file
            , params = this.params;

        return (!!file[col.Id] || file[col.Id] === false) ||
            file[col.Id] === 0 || params.showAllProperties ||
            (col.Id.indexOf('Dynamic') > -1 && (file['DynamicFields'] && !this.isEmpty(file['DynamicFields'][col.Id])) || params.showAllProperties);
    }
    private columnWithDate(colId) {
        return (colId == 'START_DATETIME' ||
                colId == 'END_DATETIME' ||
                colId=='CREATED_DT'||
                colId=='J_COMPL_BY'||
                colId=='MODIFIED_DT'||
                colId=='ACCEPT_DT'||
                colId=='PUBLISH_DATE' ||
                colId=='DEADLINE_DT' ||
                colId=='RQD_DATE'||
                colId=='LOAN_RTRN_DT' ||
                colId == 'U_FRM_TXD'||
                colId == 'U_TO_TXD') ? colId : '';
    }

    getFriendlyNamebyId(id: string) {
        return this.friendlyNames[id];
    }
}
