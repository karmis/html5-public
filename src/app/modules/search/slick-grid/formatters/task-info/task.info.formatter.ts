/**
 * Created by Sergey Trizna on 9.12.2017.
 */

import {
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    Injector,
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
import { IMFXModalProvider } from '../../../../imfx-modal/proivders/provider';
import { WorkflowWizardInfoComponent } from '../../../../../views/workflow/comps/wizards/task.info/wizard';
import { IMFXModalComponent } from '../../../../imfx-modal/imfx-modal';
import { appRouter } from '../../../../../constants/appRouter';
import {lazyModules} from "../../../../../app.routes";


@Component({
    selector: 'task-info-formatter',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TaskInfoFormatterComp {
    public injectedData: SlickGridFormatterData;
    private params;
    private provider: SlickGridProvider;
    private column: SlickGridColumn;
    private task: any;


    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = this.params.columnDef;
        this.provider = this.column.__contexts.provider;
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
    }

    onClick($event) {
        this.showInfoModal();
    }

    showInfoModal() {
        this.task = this.params.data;

        if (!this.task) {
            return;
        }

        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.wf_info,
            WorkflowWizardInfoComponent, {
                title: 'simple_assessment.history_modal_title',
                size: 'xl',
                class: 'imfx-modal stretch-modal',
                position: 'center',
                ignoreBackdropClick: false,
                backdrop: true
            });
        modal.load().then((compRef: ComponentRef<WorkflowWizardInfoComponent>) => {
            let comp: WorkflowWizardInfoComponent = compRef.instance;
            comp.showModal(this.task);
        });
    }

}

export function TaskInfoFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(TaskInfoFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



