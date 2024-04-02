import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {Router} from "@angular/router";
import {NotificationService} from "../../../../modules/notification/services/notification.service";
import {WorkflowSlickGridProvider} from "../../providers/workflow.slick.grid.provider";
import {IMFXControlsTreeComponent} from "../../../../modules/controls/tree/imfx.tree";
import {LookupSearchService} from "../../../../services/lookupsearch/common.service";
import {AreasSitesService} from "../../../../services/areas/areas.sites";
import {SlickGridProvider} from "../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {DebounceProvider} from "../../../../providers/common/debounce.provider";
import {JobService} from '../../services/jobs.service';
import {IMFXControlTreeProvider} from "../../../../modules/controls/tree/providers/control.tree.provider";
import {WFUsersIMFXControlTreeProvider} from "./providers/wf.users.tree.provider";
import {SearchFormProvider} from "../../../../modules/search/form/providers/search.form.provider";
import {TasksUsersComponent} from "../../../tasks/comps/users/users";
import {Subscription} from "rxjs/Rx";

@Component({
    selector: 'workflow-dd-users',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    providers: [
        LookupSearchService,
        AreasSitesService,
        WFUsersIMFXControlTreeProvider,
        {provide: IMFXControlTreeProvider, useClass: WFUsersIMFXControlTreeProvider},
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WorkflowUsersComponent {
    @Input('slickGridProvider') slickGridProvider: WorkflowSlickGridProvider;
    @Input('selectedAll') selectedAll: boolean = false;
    @Input('emitSearchOnLoad') emitSearchOnLoad: boolean = false;
    @Input('hideEmpty') hideEmpty: boolean = false;
    @ViewChild('tree', {static: false}) public tree: IMFXControlsTreeComponent;
    public users: any[] = [];
    public componentContext: WorkflowUsersComponent|TasksUsersComponent;
    private onSelectSbs: Subscription;
    private onUnSelectSbs: Subscription;
    public preventBuildPage: boolean = false;

    constructor(public cdr: ChangeDetectorRef,
                public injector: Injector,
                public router: Router,
                public lookupSearchService: LookupSearchService,
                public areasSitesService: AreasSitesService,
                public debounceProvider: DebounceProvider,
                public jobService: JobService,
                @Inject(NotificationService) public notificationRef: NotificationService,
                public sfp: SearchFormProvider,
                public sgp: SlickGridProvider) {
        this.componentContext = this;
    }

    ngAfterViewInit() {
        this.tree.onRenderNode.subscribe((d) => {
            let data = d.data;
            let node = data.node;
            if (node && node.data && node.data.dirtyObj) {
                let $span = $(node.span);
                let customClass = 'custom-style ' + node.data.dirtyObj.NodeType;
                node.extraClasses = customClass;
                $span.addClass(customClass);
            }
        });

        this.getLookups();
    }

    public onSelectTreeNode(event) {
        // const node = event.data.node;
        // node.visit((childNode) => {
        //     if(childNode.selected) {
        //
        //     }
        //     childNode.setSelected(event.data.node.isSelected());
        // });
        this.buildWithSelected();
    }

    buildWithSelected() {
        const searchModel = this.sfp.getModel();
        (<WorkflowSlickGridProvider>this.sgp).selectedTreeNodes = this.tree.getSelected();
        (<WorkflowSlickGridProvider>this.sgp).buildPage(searchModel, false, true);
    }

    public getLookups() {
        this.lookupSearchService.getLookup('job-schedule-nodes')
            .subscribe(
                (data: any) => {
                    if(this.hideEmpty) {
                        data = data.filter((item) => {
                            return item.Children && item.Children.length > 0;
                        });
                    }
                    this.users = this.tree.turnArrayOfObjectToStandart(data, {
                        key: 'Id',
                        title: 'NodeName',
                        children: 'Children',
                        selected: 'true',
                        active: 'true'
                    });
                    this.tree.setSource(this.users);
                    new Promise((resolve) => {
                        resolve();
                    }).then(
                        () => {
                            this.tree.selectAll();
                            if(this.emitSearchOnLoad) {
                                this.buildWithSelected();
                            }
                            this.bindSbs()
                        },
                        (err) => {
                            console.log(err);
                        }
                    );
                },
                (error: any) => {
                    console.error('Failed', error);
                });
    }

    bindSbs() {
        if (this.onSelectSbs) {
            this.onSelectSbs.unsubscribe()
        }
        if (this.onUnSelectSbs) {
            this.onUnSelectSbs.unsubscribe()
        }
        this.onSelectSbs = this.tree.onSelect.subscribe((event) => {
            if (this.preventBuildPage === false) {
                setTimeout(() => {
                    this.onSelectTreeNode(event);
                });
            }
        });
        this.onUnSelectSbs = this.tree.onUnSelect.subscribe((event) => {
            if (this.preventBuildPage === false) {
                setTimeout(() => {
                    this.onSelectTreeNode(event);
                });
            }
        });
    }

    /**
     * Filter of data
     * @param $event
     */
    filter($event) {
        if($event.target.value === '') {
            this.tree.clearFilter();
            this.tree.getTree().visit(function (node) {
                node.collapseSiblings();
            });
        } else {
            this.tree.filterCallback($event.target.value, function (str, node) {
                let normTitle = str.toLowerCase();
                let normNodeTitle = node.title.toLowerCase();
                if (normNodeTitle.indexOf(normTitle) !== -1 || node.selected === true) {
                    return true;
                }
                return false;
            });
        }

        // this.tree.filterCallback($event.target.value, function (str, node) {
        //     if (node.title != null) {
        //         let normTitle = str.toLowerCase();
        //         let normNodeTitle = node.title.toLowerCase();
        //         if (normNodeTitle.indexOf(normTitle) != -1 || node.selected == true) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     return false;
        // });
    }

    onDrop(event) {
        let mode = this.slickGridProvider.wfdragmode;
        let rows = !mode ? this.slickGridProvider.getSelectedRows() : this.slickGridProvider.item;
        let node = this.tree.getNodeByEvent(event);

        let jobs = [];
        if (!mode) {
            jobs = rows.map((n) => {
                return n.ID;
            });
        } else {
            jobs = [rows.ID];
        }

        if (node) {
            let nodeObj = node.data.dirtyObj;
            let route = mode ? 'tasks' : 'jobs';
            this.assign(nodeObj.Id, nodeObj.NodeType, jobs, 'pass', route);
        }
    }

    assign(id: number, type: string, jobs: number[] = [], action: 'pass' | 'share' | 'passclear', route) {
        this.jobService.assign(id, type, jobs, action, route).subscribe((resp: any) => {
            if (resp.Result === true) {
                this.notificationRef.notifyShow(1, "workflow.success_assign");
                (<WorkflowSlickGridProvider>this.slickGridProvider).refreshGrid();
            } else {
                this.notificationRef.notifyShow(2, "workflow.error_assign");
            }
        }, () => {
            this.notificationRef.notifyShow(2, "workflow.error_assign");
        });
    }

    onSelect($event) {
    }

    selectAll() {
        this.tree.selectAll();
    }

    public isAccessibleNode(event): boolean {
        let node = this.tree.getNodeByElement($(event.target));
        if (node && node.data.dirtyObj && node.data.dirtyObj.NodeType != "Area") {
            return true;
        }

        return false;
    }

    public highlightOff(event) {
        let trgt = this.getEventTrgt(event);
        if (!trgt.hasClass('fancytree-node')) {
            trgt = trgt.find('.fancytree-node').eq(0);
        }
        trgt.removeClass('tree-dragging');
    }

    public highlightOn(event) {
        let trgt = this.getEventTrgt(event);
        trgt.addClass('tree-dragging');
    }

    private getEventTrgt(event) {
        let trgt = $(event.target);
        if (!trgt.hasClass('fancytree-node')) {
            trgt = trgt.find('.fancytree-node').eq(0);
        }
        if (!trgt.length || !trgt.hasClass('fancytree-node')) {
            trgt = $(event.target).parent();
        }

        return trgt;
    }
}
