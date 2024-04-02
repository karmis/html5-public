import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import * as Cookies from "js-cookie";
import { WorkflowProvider } from '../../../../../providers/workflow/workflow.provider';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../../notification/services/notification.service';



@Component({
    selector: 'link-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class LinkFormatterComp {
    private params;
    private column;
    private data;
    public injectedData: SlickGridFormatterData;

    private link;
    private title;
    private jobLink;
    private fieldValue;

    constructor(private injector: Injector,
                private workflowProvider: WorkflowProvider,
                private translate: TranslateService,
                private notificationRef: NotificationService) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = this.params.columnDef;
        this.data = this.column.__deps.data;
    }

    ngOnInit() {

        let linkTemp = this.data.linkTemp;
        let linkJobTemp = this.data.linkJobTemp;
        let fieldJobValue =this.params.data[this.data.valueJobField];
        let fieldValue = this.params.data[this.data.valueField];
        this.fieldValue = fieldValue;

        if (this.data.linkTemp === 'customTaskId') {
            this.link = null;
            this.jobLink = '/' + linkJobTemp.replace(':id', fieldJobValue);
        } else if (linkTemp && fieldValue) {
            this.link = '/' + linkTemp.replace(':id', fieldValue);
        }
        this.title = this.params.data[this.column.field];

    }

    ngAfterViewInit() {
    }

    //preprocessing the transition by reference
    goToPage($event) {
        if (this.data.linkTemp === 'customTaskId' && this.fieldValue) {
            const data = {
                ID: this.fieldValue,
                TECH_REPORT_SUBTYPE: this.params.data['TECH_REPORT_SUBTYPE'],
                SUBTYPE: this.params.data['SUBTYPE'],
                TSK_TYPE: this.params.data['TSK_TYPE'],
                TSK_STATUS: this.params.data['TSK_STATUS'],
                FRIENDLY_NAME: this.params.data['FRIENDLY_NAME'],
                TSK_TYPE_text: this.params.data['TSK_TYPE_text'],
            };

            const taskName = this.workflowProvider.getTaskName(data);
            const message = this.translate.instant(
                'workflow.cant_open_task_redirect',
                {taskName}
            );
            const canNav: Promise<any> | false  = this.workflowProvider.navigateToPageByTask(data, this.params.columnDef.__contexts.provider, message)
            if (canNav === false) {
                this.workflowProvider.router.navigate([this.jobLink]);
            }
        }
    }

    isEmpty(data) {
        if (data === '' || data === undefined || data === null || data === 0) {
            return true;
        }
        return false;
    }

    isEnableTask() {

        if (this.fieldValue) {
            return true;
        }
        return false;
    }
}

export function LinkFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(LinkFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    })
}



