import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, Inject, Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { IMFXModalComponent } from "../../../../modules/imfx-modal/imfx-modal";
import { Router } from "@angular/router";
import { NotificationService } from "../../../../modules/notification/services/notification.service";
import { SlickGridProvider } from "../../../../modules/search/slick-grid/providers/slick.grid.provider";
import { SlickGridRowData } from "../../../../modules/search/slick-grid/types";
import { Select2EventType } from "../../../../modules/controls/select2/imfx.select2";
import { AdvancedFieldType } from "../../../../modules/search/advanced/types";
import { IMFXControlsLookupsSelect2Component } from "../../../../modules/controls/select2/imfx.select2.lookups";
import { HttpService } from "../../../../services/http/http.service";
import { FolderSlickGridProvider } from "../../providers/folder.slick.grid.provider";
import { map } from "rxjs/operators";
import { SlickGridService } from "../../../../modules/search/slick-grid/services/slick.grid.service";


@Component({
    selector: 'change-custom-status',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    providers: [
        SlickGridProvider,
        SlickGridService
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeCustomStatusComponent implements AfterViewInit {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('firstSelector', {static: false}) firstSelector: IMFXControlsLookupsSelect2Component;
    @ViewChild('secondSelector', {static: false}) secondSelector: IMFXControlsLookupsSelect2Component;
    private modalRef: IMFXModalComponent;
    selectedRows: SlickGridRowData[] = [];
    private selectAdvanced: AdvancedFieldType[] | any = [];
    private mediaSlickGridProvider: FolderSlickGridProvider;
    private typeGrid: 'media' | 'version';
    private selectedData = {
        type: {},
        value: []
    };
    isFormValid = false;
    payload = {
        ObjectIds: [],
        Status: {
            TypeId: 0,
            Values: []
        }
    };
    defaultSelected = {
        first: {
            selectorId: null,
            serverId: null
        },
        second: {
            selectorId: null,
            serverId: null
        }
    };

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                private router: Router,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                private slickGridProvider: SlickGridProvider,
                private httpService: HttpService,
                private notificationService: NotificationService) {

        // modal data
        this.modalRef = this.injector.get('modalRef');
    }

    ngAfterViewInit(): void {
        if (this.defaultSelected.first.selectorId !== null) {
            const value = {params: {data: [{id: this.defaultSelected.first.selectorId}]}};
            this.firstSelector.setSelected(this.defaultSelected.first.selectorId);
            this.onSelectType(value, 'first', [this.defaultSelected.second.serverId]);
        }
    }

    save() {
        this.httpService
            .put(
                `/api/v3/${this.typeGrid}/custom-status`,
                JSON.stringify(this.payload)
            )
            .subscribe(res => {
                    this.updatedRows();

                },
                er => {
                    this.notificationService.notifyShow(2, "settings_group.error", true, 1200);
                });

        this.modalRef.hide();
        // this.provider.modalIsOpen = false;
    }

    getItemFromServer(id) {
        return this.httpService
            .get(
                `/api/v3/${this.typeGrid}-details/${id}`
            )
            .pipe(map(res => res.body));
    }

    loadData(rows, type: 'media' | 'version', mediaSlickGridProvider) {
        this.selectedRows = rows;
        this.mediaSlickGridProvider = mediaSlickGridProvider;
        this.typeGrid = type;

        rows.forEach(el => {
            this.payload.ObjectIds.push(el.ID);
        });

        if (rows[0].CustomStatuses && rows[0].CustomStatuses.length !== 0) {
            this.defaultSelected.first.serverId = rows[0].CustomStatuses[0].TypeId;
            this.defaultSelected.second.serverId = rows[0].CustomStatuses[0].Values[0];
        }
        const newType = type === 'media' ? 'Media' : 'Version';
        const advanced = JSON.parse(window.sessionStorage.getItem('tmd.advanced.search.criteria.data.' + newType));
        const customMediaStatusTypes = JSON.parse(window.sessionStorage.getItem('tmd.lookups.CustomMediaStatusTypes'));

        this.selectAdvanced = advanced.FieldNameAndType
            .filter(el => el.LookupSearchType === 'CustomMediaStatus' || el.LookupSearchType === 'CustomVersionStatus')
            .map((el: AdvancedFieldType, i) => {
                if (el.Parameter === this.defaultSelected.first.serverId) {
                    this.defaultSelected.first.selectorId = String(i);
                }

                const cms = customMediaStatusTypes.find(_el => (_el.ID - 0) === (el.Parameter - 0));
                return {
                    ...el,
                    isMultiSelect: cms && cms.IsMultiSelect || false,
                    id: String(i),
                    text: el.FriendlyName
                };
            });
    }

    closeModal() {
        this.modalRef.hide();
    }

    multipleSecondSelector = false;
    onSelectType(value, payloadType: 'first' | 'second', setSecondSelectorIds = []) {
        let name = '';
        if (value !== null) {
            if (payloadType === "first") {
                const advItem = this.selectAdvanced[value.params.data[0].id];
                name = advItem.Name;
                this.selectedData.type = advItem;
                this.payload.Status.TypeId = advItem.Parameter;
                //@ts-ignore
                this.secondSelector.multiple = advItem.isMultiSelect;
                //@ts-ignore
                this.secondSelector.withCheckboxes = advItem.isMultiSelect;
                this.secondSelector.cdr.detectChanges();
                this.secondSelector.reinitPlugin();
                // }
                this.secondSelector.reloadData(name).subscribe(res => {
                    if (!setSecondSelectorIds.length) {
                        this.secondSelector.setSelected(setSecondSelectorIds);
                        this.payload.Status.Values = setSecondSelectorIds;
                        this.selectedData.value = setSecondSelectorIds;
                    }

                });
                this.isFormValid = true;
            } else {
                let val = this.secondSelector.getSelectedId() as any;
                val = (Array.isArray(val))
                    ? val.map(el => el - 0)
                    : [val - 0];
                this.payload.Status.Values = val;
                this.selectedData.value = val;
            }
        } else {
            if (payloadType === "first") {
                this.payload.Status.TypeId = 0;
                this.payload.Status.Values = [];
                this.isFormValid = false;
                this.secondSelector.clearSelect();
            } else {
                this.payload.Status.Values = [];
            }
        }

    }

    updatedRows() {
        this.mediaSlickGridProvider.refreshGridLazy();
    }

}
