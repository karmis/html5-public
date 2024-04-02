/**
 * Created by Sergey Trizna on 17.01.2018.
 */

import {
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    Injector,
    ViewEncapsulation
} from "@angular/core";
import {JobStatuses} from "../../../../constants/job.statuses";
import {
    SlickGridExpandableRowData,
    SlickGridInsideExpandRowFormatterData
} from "../../../../../../modules/search/slick-grid/types";
import {IMFXModalProvider} from '../../../../../../modules/imfx-modal/proivders/provider';
import {IMFXModalComponent} from '../../../../../../modules/imfx-modal/imfx-modal';
import {WorkflowWizardInfoComponent} from '../../../wizards/task.info/wizard';
import {SlickGridProvider} from "../../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {appRouter} from '../../../../../../constants/appRouter';
import {Subject} from 'rxjs';
import {lazyModules} from "../../../../../../app.routes";


export type WorkflowDecisionInputDataType = {
    task: any,
    provider: SlickGridProvider
}

@Component({
    selector: 'workflow-grid-rows-cell-detail-component',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        // WorkflowSlickGridProvider
        // WorkflowAccordionProvider,
        // AccordionService
    ],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class WorkflowExpandRowComponent {
    public injectedData: {
        data: SlickGridInsideExpandRowFormatterData
    };
    protected jobStatuses = JobStatuses; // dont remove.
    protected isDD: boolean = true;
    protected item: SlickGridExpandableRowData;
    private provider: any;
    protected tasks: any;
    private destroyed$: Subject<any> = new Subject();

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.item = this.injectedData.data.item;
        this.tasks = this.item.Tasks;
        this.provider = this.injectedData.data.provider;
        this.isDD = this.injectedData.data.isDD;
    }

    onClick(item, i) {
        this.provider.onClickByExpandRow(item, i);
    }

    onDoubleClick(item, i) {
        this.provider.navigateToPage(item, i);
    }

    checkIcon(item) {
        if (item.TSK_TYPE === 1) {
            let subtype = item.TECH_REPORT_SUBTYPE ? item.TECH_REPORT_SUBTYPE : item.TechReportSubtype;
            switch (subtype) {
                case "subtitleassess":
                    return true;
                case "simpleassess":
                    return true;
            }
            return false;
        } else if (item.TSK_TYPE === 62) { // media logger
            return true;
        } else if (item.TSK_TYPE === 57 && item.SUBTYPE === 'Manual') {
            return true;
        } else if (item.TSK_TYPE === 57 && item.SUBTYPE === 'Auto') {
            return true;
        }
        return false;
    }

    private getStatusObj(task: any) {
        let taskStatus = task.TSK_STATUS;
        let result = {
            'class': null,
            'status': 'on',
            'status_text': null
        };

        switch (taskStatus) {
            case JobStatuses.READY:
                result.class = 'ready';
                break;
            case JobStatuses.FAILED:
                result.class = 'failed';
                result.status = 'off';
                break;
            case JobStatuses.ABORT:
                result.class = 'failed';
                result.status = 'off';
                break;
            case JobStatuses.INPROG:
                result.class = 'inprogress';
                break;
            case JobStatuses.COMPLETED:
                result.class = 'completed';
                break;
            default:
                result.status = '';
        }
        result.status_text = task.TSK_STATUS_text.toLowerCase();

        return result;
    }

    onDragRowStart(ev, data) {
        ev.dataTransfer.setData('text/plain', 'anything');
        ev.dataTransfer.effectAllowed = 'move';
        if (!this.isDD) {
            return false;
        }
        ev.dataTransfer.effectAllowed = 'move';
        // ev.dataTransfer.setData("Text", ev.target.getAttribute('id'));
        // ev.dataTransfer.setDragImage(ev.target,100,100);
        this.provider.onDragRowStart(data);
        return true;
    }

    showInfo($event, task?) {
        if (!task) {
            return;
        }
        $event.stopPropagation();

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
            comp.showModal(task);
        });
    }
}
