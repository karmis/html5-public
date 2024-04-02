import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {Router} from "@angular/router";
import {NotificationService} from "../notification/services/notification.service";
import {VersionMediaTypesWizard, VersionWizardProvider} from "./providers/wizard.provider";
import {AdvancedCriteriaType} from "../search/advanced/types";
import {IMFXControlsLookupsSelect2Component} from "../controls/select2/imfx.select2.lookups";
import {VersionWizardMediaComponent} from "./comps/media/version.wizard.media.component";
import {appRouter} from '../../constants/appRouter';
import {IMFXModalComponent} from "../imfx-modal/imfx-modal";
import {ClipEditorService} from "../../services/clip.editor/clip.editor.service";
import { Subscription } from 'rxjs';
import {SlickGridResp} from "../search/slick-grid/types";
import {IMFXControlsSelect2Component} from "../controls/select2/imfx.select2";

@Component({
    selector: 'version-wizard-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class VersionWizardComponent {
    @ViewChild('versionWizardMediaGrid', {static: true}) public grid: VersionWizardMediaComponent;
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('controlUsageTypes', {static: false}) private controlUsageTypes: IMFXControlsSelect2Component;
    @ViewChild('controlMediaTypeFiles', {static: false}) private controlMediaTypeFiles: IMFXControlsSelect2Component;
    @ViewChild('storageDeviceControl', {static: false}) private storageDeviceControl: IMFXControlsSelect2Component;
    private modalRef: IMFXModalComponent;
    public routerEventsSubscr: Subscription;

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                @Inject(VersionWizardProvider) public provider: VersionWizardProvider,
                private router: Router,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                public clipEditorService: ClipEditorService) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });
        // ref to component
        this.provider.moduleContext = this;
        // modal data
        this.modalRef = this.injector.get('modalRef');
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.clearDropdownModels();
        setTimeout(() => {
            this.provider.updateModel('MEDIA_TYPE_text', this.getMediaTypes().Video);
            this.grid.slickGridComp.provider.updateFacetsFieldOverride([
                "storage_id",
                "usage",
                "media_format"
            ]);
            this.grid.slickGridComp.provider.buildPage(this.provider.getSearchModel());
            this.grid.slickGridComp.provider.onGridRowsUpdated.subscribe((resp: SlickGridResp) => {
                if(resp && resp.Facets && resp.Facets.Facets && resp.Facets.Facets.length > 0) {
                    resp.Facets.Facets.forEach((val, idx) =>{
                        let lookup = val.Facets.map((lookupValue)=>{
                            return {id: lookupValue.FieldKey, text: lookupValue.Field}
                        });
                        if(val.FieldId == "usage") {
                            let selected = this.controlUsageTypes.getSelected();
                            this.controlUsageTypes.setData(lookup);
                            this.controlUsageTypes.setSelectedByIds(selected, false);
                        }
                        else if(val.FieldId == "media_format") {
                            let selected = this.controlMediaTypeFiles.getSelected();
                            this.controlMediaTypeFiles.setData(lookup);
                            this.controlMediaTypeFiles.setSelectedByIds(selected, false);
                        }
                        else if(val.FieldId == "storage_id") {
                            let selected = this.storageDeviceControl.getSelected();
                            this.storageDeviceControl.setData(lookup);
                            this.storageDeviceControl.setSelectedByIds(selected, false);
                        }
                    });
                }
                else {
                    this.controlUsageTypes.setData([]);
                    this.controlMediaTypeFiles.setData([]);
                    this.storageDeviceControl.setData([]);
                }
            });
        })
    }

    ngOnDestroy(){
        this.routerEventsSubscr.unsubscribe();
    }

    clearDropdownModels() {
        this.provider.updateModel("USAGE_TYPE_text", "");
        this.provider.updateModel("MEDIA_FORMAT_text", "");
        this.provider.updateModel("STORAGE_ID", "");
    }

    updateModelFromRadio(field, value): void {
        if(this.getModel(field).Value != value) {
            this.clearDropdownModels();
            this.provider.updateModel(field, value);
            this.grid.slickGridComp.provider.buildPage(this.provider.getSearchModel());
        }
    }

    updateModel(field, value, select2Control: IMFXControlsSelect2Component): void {
        this.provider.updateModel(field, value.params.data && value.params.data.length > 0 ? value.params.data[0].id : "");
        this.grid.slickGridComp.provider.buildPage(this.provider.getSearchModel());
    }

    /**
     * Get model by field
     * @param field
     * @returns {AdvancedCriteriaType}
     */
    getModel(field): AdvancedCriteriaType {
        return this.provider.getModel(field)
    }

    /**
     * Get available media types
     * @returns {VersionMediaTypesWizard}
     */
    getMediaTypes(): VersionMediaTypesWizard {
        return this.provider.getMediaTypes();
    }

    /**
     * Hide modal
     */
    closeModal() {
        this.modalRef.hide();
        this.provider.modalIsOpen = false;
    }

    goToClipEditor() {
        let rows: Array<any> = this.getRows();
        if ($.isEmptyObject(rows) || !Array.isArray(rows)) {
            rows = $.map(rows, function (value, index) {
                return [value];
            });
        }
        this.clipEditorService.setClipEditorType('version');
        // set rows
        this.clipEditorService.setSelectedRows(rows);

        // set isAudio flag
        let isAudio = this.getModel('MEDIA_TYPE_text').Value === this.provider.getMediaTypes().Audio ? true : false;
        this.clipEditorService.setIsAudio(isAudio);

        // this.router.navigate(["clip-editor", this.provider.selectedVersionId])
        this.router.navigate(
            [
                appRouter.clip_editor_version.substr(
                    0,
                    appRouter.clip_editor_version.lastIndexOf('/')
                ),
                this.provider.selectedVersionId
            ]
        );
    }

    getRows(): Array<any> {
        let res = [];
        if (this.grid.slickGridComp.isGridReady) {
            res = this.grid.slickGridComp.provider.getOriginalData();
        }
        return res;
    }
}
