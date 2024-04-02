/**
 * Created by Ivan Banan on 02.08.2019.
 */

import {ComponentRef, HostListener, Inject, Injectable, Injector} from '@angular/core';
import {appRouter} from '../../constants/appRouter';
import {IMFXModalProvider} from '../../modules/imfx-modal/proivders/provider';
import {IMFXModalComponent} from '../../modules/imfx-modal/imfx-modal';
import {WorkflowDecisionInputDataType} from '../../views/workflow/comps/slickgrid/formatters/expand.row/expand.row.formatter';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {TranslateService} from '@ngx-translate/core';
import {NavigationEnd, ResolveEnd, Router, RouterEvent} from '@angular/router';
import {SlickGridProvider} from '../../modules/search/slick-grid/providers/slick.grid.provider';
import {WorkflowDecisionComponent} from '../../views/detail/tasks/decision/comp';
import {WorkflowListComponent} from "../../views/workflow/comps/wf.list.comp/wf.list.comp";
import {lazyModules} from "../../app.routes";
import {SessionStorageService} from 'ngx-webstorage';
import {Subject, Subscription} from "rxjs";
import {takeUntil, filter} from "rxjs/internal/operators";
import {IMFXModalEvent} from "../../modules/imfx-modal/types";
import {PreviousRouteService} from "../../services/common/previous.route.service";

@Injectable()
export class WorkflowProvider {
    public router?: Router;
    public notificationRef?: NotificationService;
    public destroyed$: Subject<any> = new Subject();
    protected translate?: TranslateService;
    private routerEventsSubscr: Subscription;
    private _shouldReopenDecisionItem: any = null;

    constructor(@Inject(Injector) public injector: Injector, public sessionStorage: SessionStorageService, private previousRouteService: PreviousRouteService) {
        this.router = injector.get(Router);
        this.translate = injector.get(TranslateService);
        this.notificationRef = injector.get(NotificationService);
        this.routerEventsSubscr = this.router.events
            .pipe(
                filter(event => event instanceof ResolveEnd) // for back button
            )
            .pipe(takeUntil(this.destroyed$)).subscribe((event: RouterEvent) => {
                if(!this.decisionIsOpen) {
                    this._navigationInterceptor(event);
                }
            });
    }

    public navigateToPageByTask(item, sgp?: SlickGridProvider, customMessage: string | null = null): Promise<any> | false {
        let rule = this.getTaskRule(item);

        switch (rule) {
            case 'media-logger-job':
                return this.goTaskByPath(appRouter.media_logger.job, item.ID);
            // return true;
            case 'component-qc':
                return this.goTaskByPath(appRouter.workflow.component_qc, item.ID);
            // return true;
            case 'assessment':
                return this.goTaskByPath(appRouter.workflow.assessment, item.ID);
            // return true;
            case 'segmenting':
                return this.goTaskByPath(appRouter.workflow.segmenting, item.ID);
            // return true;
            case 'media-logger-task':
                return this.goTaskByPath(appRouter.workflow.media_logger_task, item.ID);
            // return true;
            case 'decision':
                return this.goToDecision(item, sgp);
            // return true;
            case 'clip-editor':
                return this.goTaskByPath(appRouter.workflow.clip_editor_task, item.ID);
            // return true;
            case 'outgest':
                return this.goTaskByPath(appRouter.workflow.outgest, item.ID);
            // return true;
            case 'raised-from-tasks':
                return this.openRaisedFromTask(item);
            default:
                this.unavailableGoing(item, customMessage);
                return false;
        }
    }

    getTaskRule(item) {
        if (item.TSK_TYPE === 1) {
            let subtype = item.TECH_REPORT_SUBTYPE ? item.TECH_REPORT_SUBTYPE : item.TechReportSubtype;
            switch (subtype) {
                case "subtitleassess":
                    return 'component-qc';
                case "componentsassess":
                    return 'component-qc';
                case "simpleassess":
                    return 'assessment';
                case "segmenting":
                    return 'segmenting';
                default:
                    return null;
            }
        } else if (item.TSK_TYPE === 62) { // media logger
            return 'media-logger-task';
        } else if (item.TSK_TYPE === 57 && (item.SUBTYPE === 'Manual' || item.SUBTYPE === 'Auto')) {
            return 'decision';
        } else if (item.TSK_TYPE === 67) {
            return 'clip-editor';
        } else if (item.TSK_TYPE === 16) {
            return 'outgest';
        } else if (item.TSK_TYPE === 58 && (item.TSK_STATUS == 10 || item.TSK_STATUS == 15 || item.Status == 10 || item.Status == 15)) {
            return 'raised-from-tasks';
        } else {
            return null;
        }
    }

    openRaisedFromTask(task) {
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.wf_list,
            WorkflowListComponent, {
                title: 'Raised Workflows From Task #' + (task.Id ? task.Id : task.ID),
                size: 'xl',
                position: 'center',
                footer: 'close'
            });

        let promise = modal.load().then((modal: ComponentRef<WorkflowListComponent>) => {
            let modalContent: WorkflowListComponent = modal.instance;
            modalContent.loadDataByTask(task.Id ? task.Id : task.ID);
        });

        promise.then(() => {

        });
        return promise;
    }

    goTaskByPath(path: string, itemID) {
        return this.router.navigate(
            [
                path.substr(
                    0,
                    path.lastIndexOf('/')
                ),
                itemID
            ]
        );
    }

    public decisionIsOpen: boolean = false;
    goToDecision(item, sgp?: SlickGridProvider, clear = false) {
        let modalProvider = this.injector.get(IMFXModalProvider);
        this.sessionStorage.store('decision_item', item)
        const modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.wf_decision,
            WorkflowDecisionComponent, {
                hashAddress: 'decision_modal',
                size: 'xl',
                title: 'workflow.decision.common_title',
                position: 'center',
                dialogStyles: {
                    'max-width': '90%',
                    'max-height': '85%'
                },
                footer: 'none'
            }, <WorkflowDecisionInputDataType>{
                task: item,
                provider: sgp || null
            });
        let promise = modal.load();

        promise.then(() => {
            if (clear) {
                this.sessionStorage.clear('decision_item')
            }
        });
        modal.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name.indexOf('hide') > -1) {
                this.clearRouterObs();
                (window as any).decisionIsOpen = false;
            }
        })
        return promise;
    }

    unavailableGoing(item, customMessage: string | null = null) {
        let taskName = this.getTaskName(item);
        if (!customMessage) {
            this.notificationRef.notifyShow(2, this.translate.instant(
                'workflow.cant_open_task',
                {taskName}
                ),
                true);
        } else {
            this.notificationRef.notifyShow(2, customMessage, true);
        }
    }

    public getTaskName(item): string {
        let taskName: string = item.ID;
        if (item.FRIENDLY_NAME != null && item.FRIENDLY_NAME.length > 0) {
            taskName = item.FRIENDLY_NAME + " (" + item.ID + ")";
        } else if (item.TSK_TYPE_text !== undefined) {
            taskName = item.TSK_TYPE_text + " (" + item.ID + ")";
        }
        if (item.FriendlyName !== undefined && item.FriendlyName.length > 1) {
            taskName = item.FriendlyName + " (" + item.ID + ")";
        } else if (item.TaskTypeText && item.TaskTypeText.length > 1) {
            taskName = item.TaskTypeText + " (" + item.ID + ")";
        }

        return taskName;

    }

    clearRouterObs() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.routerEventsSubscr.unsubscribe();
    }

    ngOnDestroy() {
        this.clearRouterObs();
    }

    // @HostListener('window:popstate', ['$event'])
    private _navigationInterceptor($event) {
        // if (event instanceof ResolveEnd) {
        let prevUrl = this.previousRouteService.getPreviousUrl();
        let currentUrl = this.previousRouteService.getCurrentUrl()
        let decisionItem = this.sessionStorage.retrieve('decision_item')
        if (decisionItem && prevUrl && prevUrl.indexOf('workflow/detail') > -1 && currentUrl.indexOf('media/detail') > -1) {
            setTimeout(() => {
                if(!(window as any).decisionIsOpen) {
                    this.goToDecision(decisionItem, null, true);
                    (window as any).decisionIsOpen = true;

                }
            })
        }
        // }
    }
}
