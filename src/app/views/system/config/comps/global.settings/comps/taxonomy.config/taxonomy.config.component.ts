import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { TaxonomyType } from '../../../../../../../modules/search/taxonomy/types';
import { TaxonomyService } from '../../../../../../../modules/search/taxonomy/services/service';
import { IMFXControlsTreeComponent } from '../../../../../../../modules/controls/tree/imfx.tree';
import { Subject } from 'rxjs';
import { OverlayComponent } from '../../../../../../../modules/overlay/overlay';
import { NotificationService } from '../../../../../../../modules/notification/services/notification.service';
import { IMFXModalProvider } from '../../../../../../../modules/imfx-modal/proivders/provider';
import $ from 'jquery';
import { IMFXModalComponent } from '../../../../../../../modules/imfx-modal/imfx-modal';
import { lazyModules } from '../../../../../../../app.routes';
import { IMFXModalAlertComponent } from '../../../../../../../modules/imfx-modal/comps/alert/alert';
import { IMFXModalEvent } from '../../../../../../../modules/imfx-modal/types';

@Component({
    selector: 'global-settings-taxonomy-config',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TaxonomyService]
})

export class GlobalSettingsTaxonomyConfigComponent {
    editSetups: any = {
        // Available options with their default:
        adjustWidthOfs: null,   // null: don't adjust input size to content
        inputCss: {minWidth: "auto"},
        triggerStart: ["dblclick"],
        beforeEdit: this.beforeEdit,   // Return false to prevent edit mode
        edit: this.edit,         // Editor was opened (available as data.input)
        beforeClose: $.noop,  // Return false to prevent cancel/save (data.input is available)
        save: this.save,         // Save data.input.val() or return false to keep editor open
        close: $.noop,        // Editor was removed
    };
    @ViewChild('tree', {static: false}) private tree: IMFXControlsTreeComponent;
    @ViewChild('overlay', {static: true}) private overlay: OverlayComponent;
    @ViewChild('wrapper', {static: false}) private wrapper: ElementRef;
    private destroyed$: Subject<any> = new Subject();
    public context = this;
    constructor(private taxonomyService: TaxonomyService,
                private notificationRef: NotificationService,
                private modalProvider: IMFXModalProvider) {
    }

    ngAfterViewInit() {
        this.overlay.show(this.wrapper.nativeElement);
        this.tree.onAddItem.subscribe((node) => {
            this.onAdd(node)
        });
        this.tree.onRemoveItem.subscribe((node) => {
            this.onRemove(node)
        });
        this.getTaxonomy();
    }

    getTaxonomy() {
        this.taxonomyService.getTaxonomyConfig(false).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: TaxonomyType) => {
            let normData = this.tree.turnArrayOfObjectToStandart(res.Children, {
                key: 'ID',
                title: 'SUBJECT_NAME',
                children: 'Children',
                // checked: 'IsChecked'
            });
            this.tree.setSource(normData);
            this.overlay.hide(this.wrapper.nativeElement);
            // this.tree.expandAll();
        });
    };

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    filterTree($event) {
        const filterStr: string = $event ? $event.target.value : "";
        this.tree.filterCallback(filterStr, (str, node) => {
            if (node.title != null) {
                let normTitle = str.toLowerCase();
                let normNodeTitle = node.title.toLowerCase();
                return (normNodeTitle.indexOf(normTitle) !== -1);
            }
            return false;
        });
    }

    beforeEdit(event, data) {
        if (data.node.key === '__not_found__') {
            return false
        }
        return true;
    }

    edit(event, data) {
        data.input.val(data.node.data.dirtyObj.SUBJECT_NAME);
    }

    save(event, data) {
        const self: GlobalSettingsTaxonomyConfigComponent = data.node.compContext;
        const newTitle = data.input.val()
        if (self.isNewNode(data.node)) {
            self.onCreateNode(data.node, newTitle)
        } else {
            self.onUpdateNode(data.node, newTitle)
        }
        return true;
    }

    onRemove(n = null) {
        const node = n||this.tree.getActiveNode();
        this.onRemoveNode(node);
    }

    onEdit() {
        const node = this.tree.getActiveNode();
        if (node){
            node.editStart();
        }
    }

    onAdd(n = null) {
        const node = n||this.tree.getRootNode();
        if (node.key === '__not_found__') {
            return
        }
        const newNodeName = "new node";
        node.editCreateNode("child", {
            title: newNodeName,
            folder: false,
            data: {
                dirtyObj: {
                    ID: 0,
                    SUBJECT_NAME: newNodeName,
                    PARENT_ID: node.data.dirtyObj ? node.data.dirtyObj.ID : 0,
                    Children: []
                }
            }
        });

    }

    public onCreateNode(node, name) {
        const parentNode = node.parent;
        if (!parentNode) {
            throw new Error('>>> Current node has not parent');
        }
        if (!parentNode.data.dirtyObj) {
            parentNode.data.dirtyObj = {
                ID: 1
            }
        }
        if (!parentNode.data.dirtyObj.Children) {
            parentNode.data.dirtyObj.Children = [];
        }
        // common structure
        const struct = {
            ID: 0,
            SUBJECT_NAME: name,
            PARENT_ID: null,
            active: 1,
            Children: []
        }

        this.taxonomyService.createNode(parentNode.data.dirtyObj.ID, struct).subscribe((res: any[]) => {
            const createdNode = res[0].Children.reduce((max, obj) => (max.ID > obj.ID) ? max : obj)
            const title = this.tree.showKey?createdNode.SUBJECT_NAME + ' (' + createdNode.ID + ')':createdNode.SUBJECT_NAME;
            node.data.dirtyObj.ID = createdNode.ID
            node.data.dirtyObj.SUBJECT_NAME = createdNode.SUBJECT_NAME
            node.key = createdNode.ID
            node.setTitle(title)
            const nodeSpan$ = $(node.span);
            nodeSpan$.data('rendered', false)
            this.tree.modifyEditNode(node);
            this.notificationRef.notifyShow(1, 'Taxonomy has been updated');
        })
    }


    public onUpdateNode(node, newTitle) {
        if (node.data.dirtyObj.SUBJECT_NAME == newTitle) {
            return;
        }
        this.taxonomyService.updateNode(node, newTitle).subscribe((res) => {
            if ('ok' === res) {
                this.notificationRef.notifyShow(1, 'Taxonomy changes has been saved');
            } else {
                this.notificationRef.notifyShow(2, res);
            }
        });
    }


    public onRemoveNode(node) {
        if (!node) {
            return;
        }
        if (node.key === '__not_found__') {
            return;
        }
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal, IMFXModalAlertComponent, {
            title: 'settings_group.taxonomy_config.remove_title',
            size: 'md',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then((cd: any) => {
            const alertModal: IMFXModalAlertComponent = cd.instance;
            alertModal.setText('settings_group.taxonomy_config.remove', {nodeName: node.title});
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    if (!this.isNewNode(node)) {
                        this.taxonomyService.removeNode(node).subscribe((res) => {
                            this.notificationRef.notifyShow(1, 'settings_group.taxonomy_config.remove_successful');
                            node.remove();
                            modal.hide()
                        }, (err: string) => {
                            if (err) {
                                this.notificationRef.notifyShow(2, err)
                            } else {
                                this.notificationRef.notifyShow(2, 'Unknown Error')
                            }
                            modal.hide()
                        })
                    } else {
                        node.remove();
                        modal.hide();
                    }
                }
            })
        });
    }

    private isNewNode(node): boolean {
        return !($.isNumeric(node.key)||node.key.indexOf('_') === -1);
    }
}
