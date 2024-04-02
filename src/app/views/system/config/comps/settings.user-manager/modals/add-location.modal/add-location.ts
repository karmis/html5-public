import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NotificationService } from "../../../../../../../modules/notification/services/notification.service";
import { TranslateService } from '@ngx-translate/core';
import { IMFXControlsTreeComponent } from "../../../../../../../modules/controls/tree/imfx.tree";
import { LookupSearchLocationService } from "../../../../../../../services/lookupsearch/location.service";
import { LocationsListLookupTypes } from "../../../../../../../modules/search/location/types";
import { TreeStandardListTypes } from "../../../../../../../modules/controls/tree/types";

@Component({
    selector: 'add-location-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        LookupSearchLocationService
    ]
})

export class AddLocationModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalLocationOverlayWrapper', {static: true}) private modalLocationOverlayWrapper: ElementRef;
    @ViewChild('tree', {static: true}) private tree: IMFXControlsTreeComponent;

    private locations: TreeStandardListTypes = [];
    private modalRef: any;
    private isNew = false;
    private readonly itemData;
    private context;
    private withHighlight = false;
    private selectedItems = [];

    constructor(private injector: Injector,
                private cd: ChangeDetectorRef,
                private lookupSearchLocationService: LookupSearchLocationService,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.itemData = d.itemData;
        this.context = d.context;
        this.withHighlight = d.withHighlight;
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalLocationOverlayWrapper.nativeElement).show();
        }
        else {
            $(this.modalLocationOverlayWrapper.nativeElement).hide();
        }
        this.cd.detectChanges();
    }

    ngOnInit() {
        this.toggleOverlay(true);
        this.tree.onRenderNode.subscribe((res: any) => {
            if (res.data.node.data.dirtyObj) {
                if (res.data.node.data.dirtyObj.LOC_TYP == 0) {
                    $(res.data.node.li).find('span.fancytree-checkbox').addClass('highlighted-site');
                }
                else if (res.data.node.data.dirtyObj.LOC_TYP == 1) {
                    $(res.data.node.li).find('span.fancytree-checkbox').addClass('highlighted-area');
                }
            }
        });
    }

    ngOnDestroy() {
        this.tree.onRenderNode.unsubscribe();
    }

    ngAfterViewInit() {
        this.lookupSearchLocationService.getLocations()
            .subscribe(
                (data: LocationsListLookupTypes) => {
                    let normData: TreeStandardListTypes = this.tree.turnArrayOfObjectToStandart(
                        data,
                        {
                            key: 'ID',
                            title: 'NAM',
                            children: 'Children'
                        }
                    );
                    this.locations = normData;
                    this.tree.setSource(this.locations);
                    setTimeout(() => {
                        this.toggleOverlay(false);
                        if (this.itemData != null) {
                            this.setCheckboxByObjId(this.itemData);
                        }
                    });
                },
                (error: any) => {
                    console.error('Failed', error);
                }
            );
    }

    closeModal() {
        this.modalRef.hide();
    }

    saveData() {
        this.modalRef.emitClickFooterBtn('ok', this.selectedItems);
        this.modalRef.hide();
    }

    filter($event) {
        if ($event.target.value === '') {
            this.tree.clearFilter();
            this.tree.getTree().visit(function (node) {
                node.collapseSiblings();
            });
        } else {
            this.tree.filterCallback($event.target.value, function (str, node) {
                let normTitle = str.toLowerCase();
                let normNodeTitle = node.title.toLowerCase();
                if (normNodeTitle.indexOf(normTitle) !== -1/* || node.selected === true*/) {
                    return true;
                }
                return false;
            });
        }
    }

    onSelect(event) {
        this.selectedItems = event.data;
    }

    setCheckboxByObjId(id) {
        let self = this;
        this.tree.getTree().visit(function (n) {
            if (n.key == id) {
                n.setSelected(true);
                n.selected = true;
            }
        });
    }
}
