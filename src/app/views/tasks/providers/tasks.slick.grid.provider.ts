/**
 * Created by Sergey Trizna on 13.01.2018.
 */
import {
    ApplicationRef,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    Inject,
    Injectable,
    Injector
} from "@angular/core";
import { BasketService } from "../../../services/basket/basket.service";
import { Router } from "@angular/router";
import { SlickGridEventData } from "../../../modules/search/slick-grid/types";
import { WorkflowSlickGridProvider } from "../../workflow/providers/workflow.slick.grid.provider";
import { SearchModel } from "../../../models/search/common/search";
import { AdvancedSearchModel } from "../../../models/search/common/advanced.search";
import { IMFXModalComponent } from "../../../modules/imfx-modal/imfx-modal";
import { IMFXModalAlertComponent } from "../../../modules/imfx-modal/comps/alert/alert";
import { IMFXModalEvent } from "../../../modules/imfx-modal/types";
import { lazyModules } from "../../../app.routes";

@Injectable()
export class TasksSlickGridProvider extends WorkflowSlickGridProvider {
    public router?: Router;
    public basketService?: BasketService;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public selectedSubRow?: { id?: number, index?: number } = {};
    public expandedRows?: number[] = [];
    public cdr: ChangeDetectorRef;
    public wfdragmode: string;
    item: any;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.basketService = injector.get(BasketService);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.cdr = injector.get(ChangeDetectorRef);
    }

    onDragRowStart($event) {
        this.wfdragmode = $event ? $event.mode : null;
        this.item = $event ? $event.item : null;
    }

    onRowDoubleClicked(data: SlickGridEventData){
        this.navigateToPageByTask(data.row);
    }
    buildPage(searchModel: SearchModel, resetSearch: boolean = false, withOverlays: boolean = true) {
        if(this.config.componentContext.isOpenedSchedule) {
            searchModel.setAdvanced(searchModel.removeAdvancedItemByDBField('SCHEDULE'));
            let ids = [];
            let asm = new AdvancedSearchModel();
            asm.setDBField('SCHEDULE');
            asm.setField('Schedule');
            asm.setOperation('=');
            let selectedNodes = this.selectedTreeNodes;
            if (selectedNodes && selectedNodes.length > 0) {
                $.each(selectedNodes, (k, node) => {
                    let dirtyData = node.data.dirtyObj;
                    let id = dirtyData.NodeType == 'User' ? dirtyData.Id * (-1) : dirtyData.Id;
                    ids.push(id);
                });
                asm.setValue(ids);
                searchModel.addAdvancedItem(asm);
            }
        }

        super.buildPage(searchModel, resetSearch, withOverlays);
    }
    refreshGrid(withOverlays: boolean = false) {
        if (this.lastSearchModel) {
            this.buildPage(this.lastSearchModel, false, withOverlays);
            (<any>this.componentContext).refreshStarted = false;
        }
    }

    public isUnassignTaskEnabled () {
        let rowsData = this.getSelectedRowsData();
        let filteredData = rowsData.filter(el => !!el['OP_NAME']);
        if (filteredData.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    public unassignTask($event) {
        let rowsData = this.getSelectedRowsData().filter(el => !!el['OP_NAME']);

        if (!rowsData || rowsData.length == 0) {
            return;
        }

        let text, textParams
            ,ids = rowsData.map(el => el['ID']);

        if (rowsData.length == 1) {
            text = 'tasks.modal_unassign_conformation';
            textParams = rowsData[0]['CMB_IN_TTLS_text'] + "  ( ID - " + rowsData[0]['ID'] + " )";
        } else if (rowsData.length > 1 && rowsData.length < 5) {
            text = 'tasks.unassign_task_items_less_5';
            textParams = ids.join(', ');
        } else {
            text = 'tasks.unassign_task_items_more_5';
            textParams = rowsData.length;
        }

        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr =>{
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                text,
                {params: textParams}
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    this.jobService.unassign(ids, 'tasks').subscribe((resp) => {
                        this.notificationService.notifyShow(1, "tasks.success_unassign");
                        this.refreshGrid();
                        modal.hide();
                    }, () => {
                        this.notificationService.notifyShow(2, "tasks.error_unassign");
                    }, () => {

                    });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }
}
