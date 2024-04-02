import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { TreeStandardIndexedListTypes, TreeStandardListTypes } from "../../../../../../../modules/controls/tree/types";
import { IMFXControlsTreeComponent } from "../../../../../../../modules/controls/tree/imfx.tree";
import { LookupLocationType } from "../../../../../../../services/system.config/search.types";
import { LookupSearchService } from "../../../../../../../services/lookupsearch/common.service";
import { Observable, of, Subject } from 'rxjs';
import { ReportsPermissionsType, ResponsibilitiesType } from "../../modals/group.modal/group.modal.component";
import { ProfileService } from "../../../../../../../services/profile/profile.service";
import { takeUntil } from 'rxjs/operators';
import * as $ from "jquery";
import { UserManagerService } from "../../services/settings.user-manager.service";
import { Guid } from '../../../../../../../utils/imfx.guid';

export type SchedulesAreasType = {
    AREA_ID: number,
    CHILD_ACCESS: string,
    USER_ACCESS: string
};

@Component({
    selector: 'responsibilities_tree',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    providers: [
        LookupSearchService,
        UserManagerService
    ],
    styleUrls: [
        './styles/styles.scss'
    ],
})

export class SettingsUserManagerResponsibilitiesTreeComponent {
    componentContext = this;
    @Output('onUpdateResponsibility') onUpdateResponsibility: EventEmitter<ResponsibilitiesType[]> = new EventEmitter<ResponsibilitiesType[]>();
    @Output('onUpdateReportsPermissions') onUpdateReportsPermissions: EventEmitter<ReportsPermissionsType[]> = new EventEmitter<ReportsPermissionsType[]>();
    @Output('onUpdateSchedules') onUpdateSchedules: EventEmitter<SchedulesAreasType[]> = new EventEmitter<SchedulesAreasType[]>();
    @Input('readonly') isReadonly: boolean = false;
    @Input('showSelectAllButton') showSelectAllButton: boolean = false;
    selectAllButton = true;
    deselectAllButton = false;
    responsibility_expandCollaps_isPlanning = false; // indicate: is settimeout planning. (px-4145)
    private activeTab: number = 0;
    private _responsibilities: TreeStandardListTypes = [];
    private _reportsPermissions: TreeStandardListTypes = [];
    private byteRead: number = 1;
    private byteModify: number = 2;
    private byteDelete: number = 4;
    @ViewChild('responsibilitiesTree', {static: true}) private responsibilitiesTree: IMFXControlsTreeComponent;
    @ViewChild('reportsPermissionsTree', {static: true}) private reportsPermissionsTree: IMFXControlsTreeComponent;
    @ViewChild('schedulesTree', {static: true}) private schedulesTree: IMFXControlsTreeComponent;
    private filterStr: RegExp;
    private locations: LookupLocationType[] = [];
    private _schedules: { [key: number]: SchedulesAreasType } = {};
    private _originalSchedules: SchedulesAreasType[] = [];
    private locationsHandler: Observable<any>;
    private keysResponsibilities: { [key: number]: ResponsibilitiesType } = {};
    private _originalResponsibilities: ResponsibilitiesType[] = [];
    private _originalReportsPermissions: ReportsPermissionsType[] = [];
    private maxWidth = 0;
    private destroyed$: Subject<any> = new Subject<any>();
    private _debugIDShowed = false;
    schedulesModThree = false;
    responsibilitiesModThree = false;

    constructor(protected lookupSearchService: LookupSearchService,
                protected profileService: ProfileService,
                protected userManagerService: UserManagerService,
                protected cdr: ChangeDetectorRef) {
        this.locationsHandler = this.userManagerService.getAllLocations();
        this.lookupSearchService.getLookup('locations').subscribe((res) => {

        });
    }

    @Input('responsibilities') set _setResponsibilities(responsibilities: ResponsibilitiesType[]) {
        // this._originalResponsibilities = JSON.parse(JSON.stringify(responsibilities));
        // for avoid memory leaks
        this._originalResponsibilities = responsibilities;
        this.setResponsibilities(this._originalResponsibilities);
    }

    @Input('schedules') set _setSchedules(schedules) {
        // this._originalSchedules = JSON.parse(JSON.stringify(schedules));
        // for avoid memory leaks
        this._originalSchedules = schedules;
        this.setSchedules(this._originalSchedules);
    }

    @Input('reportsPermissions') set _setReportsPermissions(reportsPermissions) {
        // this._originalReportsPermissions = JSON.parse(JSON.stringify(reportsPermissions));
        // for avoid memory leaks
        this._originalReportsPermissions = reportsPermissions;
        this.setReportsPermissions(this._originalReportsPermissions);
    }

    public setReportsPermissions(reportPermissions: ReportsPermissionsType[]) {
        this._reportsPermissions = this.reportsPermissionsTree.turnArrayOfObjectToStandart(this.prepareReportsPermissionsList(reportPermissions), {
            key: 'ID',
            title: 'NAME',
            children: '_children',
            selected: 'IS_SELECTED',
        });
    }

    public setResponsibilities(responsibilities: ResponsibilitiesType[]) {
        this._responsibilities = this.responsibilitiesTree.turnArrayOfObjectToStandart(this.prepareResponsibilitiesList(responsibilities), {
            key: 'RESPONSIBILITY_ID',
            title: 'NAME',
            children: '_children',
            selected: 'IS_SELECTED',
        });
        responsibilities.forEach(el => {
            this.keysResponsibilities[el.RESPONSIBILITY_ID] = el;
        })
    }

    public setSchedules(schedules: SchedulesAreasType[]) {
        this._schedules = {};
        // indexes
        schedules.forEach((sch: SchedulesAreasType) => {
            if (sch && sch.AREA_ID != null) {
                this._schedules[sch.AREA_ID] = sch;
            }
        });
    }

    public renderReportsPermissionsTree() {
        this.reportsPermissionsTree.setSource(this._reportsPermissions);
    }

    ngAfterViewInit() {
        this.renderTree();
        this.renderSchedulesTree();
        this.renderReportsPermissionsTree();
        this.profileService.getUserProfile().pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            if (res["UserID"] == "TMDDBA") {
                this._debugIDShowed = true;
                //this.renderTree();
                //this.renderSchedulesTree();
            }
        })
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    toggleTab(id) {
        this.activeTab = id;
        if (id == 0) {
            setTimeout(() => {
                if (this.destroyed$.isStopped) {
                    return;
                }
                this.responsibility_expandCollaps();
            });
        } else if (id == 1) {
            setTimeout(() => {
                if (this.destroyed$.isStopped) {
                    return;
                }
                this.schedules_expandCollaps();
            });
        } else if (id == 2) {
            setTimeout(() => {
                if (this.destroyed$.isStopped) {
                    return;
                }
                this.reportsPermissions_expandCollaps();
            });
        }
    }


    schedules_expandCollaps() {
        this.on_expandCollaps(".tree-group-permissions.schedules-tree");
    }

    getOffsetRecursive(node, offset) {
        if ($($(node).parent()[0]).hasClass("fancytree-container")) {
            offset += $($(node).parent()[0]).offset().left;
            return this.getOffsetRecursive($(node).parent()[0], offset);
        } else {
            offset += $($(node).parent()[0]).offset().left;
            return offset;
        }
    }

    /**
     * SCHEDULES
     */
    public renderSchedulesTree() {
        if (this.locations.length === 0) {
            this.locationsHandler.pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                this.locations = res;
                this.schedulesTree.setSource(this.schedulesTree.turnArrayOfObjectToStandart(this.locations, {
                    key: 'ID',
                    title: 'NAM',
                    children: 'Children',
                }));
            });
        } else {
            this.schedulesTree.setSource(this.schedulesTree.turnArrayOfObjectToStandart(this.locations, {
                key: 'ID',
                title: 'NAM',
                children: 'Children',
            }));
        }
    }

    schedulesChangeItem(id, childAccess: '0' | '1', userAccess: '0' | '1', withRender = true) {
        const found = this._originalSchedules.find(el => Number(el.AREA_ID) === Number(id));
        if (found) {
            found.CHILD_ACCESS = childAccess;
            found.USER_ACCESS = userAccess;
        } else {
            this._originalSchedules.push({
                AREA_ID: Number(id),
                CHILD_ACCESS: childAccess,
                USER_ACCESS: userAccess
            })
        }

        this.setSchedules(this._originalSchedules);

        if (withRender) {
            const className = 'fancytree-checkboxCheck';
            const $aresEl = $('#' + id).find('[data-inctype="areas"]');
            const $usersEl = $('#' + id).find('[data-inctype="users"]');

            if (childAccess === '1') {
                $($aresEl).addClass(className);
            } else {
                $($aresEl).removeClass(className);
            }

            if (userAccess === '1') {
                $($usersEl).addClass(className);
            } else {
                $($usersEl).removeClass(className);
            }

        }
    }

    schedulesCheckParents(node) {
        const checkParent = (parent) => {
            if (parent === null) {
                return
            }
            parent.selected = true;
            setTimeout(() => {
                if (this.checkPartselSchedules(parent)) {
                    $(parent.span).addClass('fancytree-partsel')
                } else {
                    $(parent.span).addClass('fancytree-partsel fancytree-selected')
                }

                $(parent.span).find('.fancytree-checkbox').addClass('fancytree-checkboxCheck');
            }, 50)

            checkParent(parent.parent);
        }
        checkParent(node.parent);
    }

    onSchedulesClick(event) {
        this.schedulesTree.getTree().rootNode.visit((chNode) => {
            new Promise((resolve) => {
                resolve();
            }).then(
                () => {
                    if (chNode.needToAllSelected) {
                        this.schedulesChangeItem(chNode.key, '1', '1');
                        chNode.selected = true;
                        chNode.partselCustom = false;
                        chNode.needToAllSelected = false;
                        this.schedulesModThree = true;
                        setTimeout(() => {
                            $(chNode.span).find('.fancytree-checkbox').addClass('fancytree-checkboxCheck')
                            $(chNode.span).addClass('fancytree-partsel fancytree-selected')
                        }, 100)
                        this.schedulesCheckParents(chNode);
                    } else {
                        if (this.checkPartselSchedules(chNode)) {
                            $(chNode.span).removeClass('fancytree-selected')
                            this.nodeSetPartselSchedules(chNode, true);
                            setTimeout(() => {
                                $(chNode.span).removeClass('fancytree-selected')
                                this.nodeSetPartselSchedules(chNode, true);
                            }, 300)
                        } else {
                            $(chNode.span).addClass('fancytree-selected')
                            // @ts-ignore
                            this.nodeSetPartselSchedules(chNode, false);
                        }
                    }
                    this.schedulesModThree = false;
                },
                (err) => {
                    console.log(err);
                }
            );
        });
    }

    checkPartselSchedules(node) {
        if (node.key.indexOf('r') === 0) {
            return false
        }
        const foundIds = (ar) => {
            if (!ar) return [];
            ar.Children.forEach(el => {
                childId.push(el.ID)
                if (el.Children && el.Children.length > 0) {
                    foundIds(el)
                }
            })
        }

        const obj = node.data.dirtyObj;
        const childId = []
        if (obj && obj.LOC_TYP !== 0) {
            childId.push(obj.ID)
        }
        foundIds(obj);

        let countAdditionalSelected = 0;
        let allAdditional = childId.length * 2;


        childId.forEach(ids => {
            const sched = this._schedules[ids];
            if (sched) {
                if (sched.CHILD_ACCESS === '1') {
                    countAdditionalSelected++;
                }
                if (sched.USER_ACCESS === '1') {
                    countAdditionalSelected++;
                }
            } else {
                $('#' + ids).find('[data-inctype="areas"]').removeClass('fancytree-checkboxCheck')
                $('#' + ids).find('[data-inctype="users"]').removeClass('fancytree-checkboxCheck')
            }
        })
        node.partselCustom = countAdditionalSelected === 0 && node.selected === false ? false : allAdditional > countAdditionalSelected;
        return allAdditional > countAdditionalSelected
    }

    nodeSetPartselSchedules(node, status) {
        // node.partselCustom = status;
    }

    schedules_onRenderNode($event) {
        let data = $event.data;
        let node = data.node;
        if (this.checkPartselSchedules(node)) {
            $(node.span).removeClass('fancytree-selected')
            this.nodeSetPartselSchedules(node, true);
            setTimeout(() => {
                $(node.span).removeClass('fancytree-selected')
                this.nodeSetPartselSchedules(node, true);
            }, 300)
        } else {
            this.nodeSetPartselSchedules(node, false);
        }
        node.visit((chNode) => {
            new Promise((resolve) => {
                resolve();
            }).then(
                () => {
                    this.schedules_onRenderNodeProcess(chNode);

                    if (this.checkPartselSchedules(chNode)) {
                        $(chNode.span).removeClass('fancytree-selected');
                        this.nodeSetPartselSchedules(chNode, true);
                        setTimeout(() => {
                            $(chNode.span).removeClass('fancytree-selected');
                            this.nodeSetPartselSchedules(chNode, true);
                        }, 300)
                    } else {
                        this.nodeSetPartselSchedules(chNode, false);
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
        });
    }

    schedules_onRenderNodeProcess(node) {
        let $span = $(node.span);
        let dirtyObj = node.data.dirtyObj;
        if (this._schedules[dirtyObj.ID]) {
            const dataStatus = {
                areas: this._schedules[dirtyObj.ID].CHILD_ACCESS == '1',
                users: this._schedules[dirtyObj.ID].USER_ACCESS == '1',
                main: {
                    status: node.selected,
                    el: node.li
                }
            }
            if (dataStatus.main.status && ((dataStatus.areas && !dataStatus.users) || (!dataStatus.areas && dataStatus.users) || (!dataStatus.areas && !dataStatus.users))) {
                // $(dataStatus.main.el).find('span.fancytree-node').removeClass('fancytree-selected')
            }

        }
        if (node.title && this.filterStr && node.title.toLocaleLowerCase().indexOf(this.filterStr) === -1 || node.title.length == 0) {
            let $spanPerm = $span.parent().find(('div.additional-block#' + node.key)).eq(0);
            if ($spanPerm.length) {
                $spanPerm.remove();
            }
            return true;
        }

        $span.css({
            paddingTop: 3,
            paddingBottom: 3
        });

        if (!$span.parent().find('div.additional-block#' + node.key).length) {
            $span.parent().append('<div class="additional-block" id="' + node.key + '"></div>');
        }
        let $spanPerm = $span.parent().find(('div.additional-block#' + node.key));
        $spanPerm.empty();

        // is active?
        let activeCheckboxEl = '';
        if (this.isReadonly) {
            activeCheckboxEl = 'fancytree-disabled';
        }
        // is checked?

        let isSelectedNode = !!this._schedules[dirtyObj.ID];
        if (this._schedules[dirtyObj.ID] !== undefined) {
            if (this.isReadonly) {
                node.unselectable = false;
                node.setSelected(isSelectedNode);
                node.unselectable = true;
            } else {
                node.setSelected(isSelectedNode);

            }
        }

        // node.partsel = true;
        //
        let statusAreasCheckboxEl = '';
        let statusUsersCheckboxEl = '';
        if (isSelectedNode) {
            statusAreasCheckboxEl = this._schedules[dirtyObj.ID].CHILD_ACCESS === '1' ? 'fancytree-checkboxCheck' : '';
            statusUsersCheckboxEl = this._schedules[dirtyObj.ID].USER_ACCESS == '1' ? 'fancytree-checkboxCheck' : '';
        }

        $spanPerm.append(
            '<span class="mask-checkboxes">' +
            '<span data-inctype="areas" data-id="' + Guid.newGuid() + '" class="fancytree-checkbox imfx-fancytree-checkbox-custom ' + activeCheckboxEl + ' ' + statusAreasCheckboxEl + '"></span> Include All Areas ' +
            '</span>'
        );

        $spanPerm.append(
            '<span class="mask-checkboxes">' +
            '<span data-inctype="users" data-id="' + Guid.newGuid() + '"  class="fancytree-checkbox imfx-fancytree-checkbox-custom ' + activeCheckboxEl + ' ' + statusUsersCheckboxEl + '"></span> Include All Users ' +
            '</span>'
        );

        if (!this.isReadonly) {
            $($spanPerm).find('span[data-inctype]').unbind().bind('click', (e: JQueryEventObject | any) => {
                this.schedules_recalculateNode(e, node);
            });
        }
        setTimeout(() => {
            if (this.destroyed$.isStopped) {
                return;
            }
            this.schedules_expandCollaps();
        });

    }

    schedules_onSelectUnselectNode($event) {
        if (this.schedulesModThree) {
            return
        }
        let node = $event.data.node;
        let nodeRes: LookupLocationType = node.data.dirtyObj;
        let idContainerExtraCheckboxes = nodeRes.ID;
        let nodeExist: boolean = false;

        if (node.isSelected()) {
            $.each(this._originalSchedules, (k, sch: SchedulesAreasType) => {
                if (!sch) {
                    this._originalSchedules.slice(k, 1)
                } else {
                    if (nodeRes.ID === sch.AREA_ID) {
                        nodeExist = true;
                        return false;
                    }
                }
            });
            if (!nodeExist) {
                this._originalSchedules.push(<SchedulesAreasType>{
                    AREA_ID: nodeRes.ID,
                    CHILD_ACCESS: '0',
                    USER_ACCESS: '0'
                });
            }
        } else {

            this._originalSchedules = this._originalSchedules.filter((sch: SchedulesAreasType) => {
                return sch && sch.AREA_ID !== nodeRes.ID;
            });
            $(node.li).find('#' + idContainerExtraCheckboxes + ' .fancytree-checkboxCheck').each(
                (k, li) => {
                    $(li).removeClass('fancytree-checkboxCheck');
                }
            );
        }
        node.needToAllSelected = !node.selected && node.partselCustom;
        node.visit((chNode) => {
            chNode.needToAllSelected = !node.selected && node.partselCustom;
            if (chNode.isSelected()) {
                let exist: boolean = false;
                $.each(this._originalSchedules, (k, sch: SchedulesAreasType) => {
                    if (!sch) {
                        this._originalSchedules.slice(k, 1)
                    } else {
                        if (chNode.ID === sch.AREA_ID) {
                            nodeExist = true;
                            return false;
                        }
                    }
                });
                if (!exist) {
                    // needToAdd.push(chNode.data.dirtyObj.ID);
                    this._originalSchedules.push(<SchedulesAreasType>{
                        AREA_ID: chNode.data.dirtyObj.ID,
                        CHILD_ACCESS: '0',
                        USER_ACCESS: '0'
                    });
                }
            } else {
                // needToDelete.push(chNode.data.dirtyObj.ID);
                this._originalSchedules = this._originalSchedules.filter((sch: SchedulesAreasType) => {
                    return sch.AREA_ID !== chNode.data.dirtyObj.ID;
                });
                $(chNode.li).find('.additional-block .fancytree-checkboxCheck').each(
                    (k, li) => {
                        $(li).removeClass('fancytree-checkboxCheck');
                    }
                );

            }

            if (this.checkPartselSchedules(chNode)) {
                $(chNode.span).removeClass('fancytree-selected')
                this.nodeSetPartselSchedules(chNode, true);
                setTimeout(() => {
                    $(chNode.span).removeClass('fancytree-selected')
                    this.nodeSetPartselSchedules(chNode, true);
                }, 100)
            } else {
                $(chNode.span).addClass('fancytree-selected')
                this.nodeSetPartselSchedules(chNode, false);
            }


        });
        const parents = node.getParentList();
        if (parents.length > 0) {
            node.getParentList().forEach((parentNode) => {
                if (parentNode.isSelected()/* && parentNode.data.dirtyObj.Parent !== null*/) {
                    this._originalSchedules.push(<SchedulesAreasType>{
                        AREA_ID: parentNode.data.dirtyObj.ID,
                        CHILD_ACCESS: '0',
                        USER_ACCESS: '0'
                    });
                    let ckCpunt = 0;
                    $(parentNode.li).find('#' + idContainerExtraCheckboxes + ' .fancytree-checkboxCheck').each(
                        (k, li) => {
                            if ($(li).hasClass('fancytree-checkboxCheck')) {
                                ckCpunt++
                            }
                        }
                    );

                } else {
                    // needToDelete.push(chNode.data.dirtyObj.ID);
                    this._originalSchedules = this._originalSchedules.filter((sch: SchedulesAreasType) => {
                        return sch.AREA_ID !== parentNode.data.dirtyObj.ID;
                    });
                    $(parentNode.li).find('#' + idContainerExtraCheckboxes + ' .fancytree-checkboxCheck').each(
                        (k, li) => {
                            $(li).removeClass('fancytree-checkboxCheck');
                        }
                    );
                }
            });
        }
        // this.schedules_RecursionChildren(node, 0);
        this.onUpdateSchedules.emit(this.filterDuplicates(this._originalSchedules));

        if (this._schedules && this._schedules[idContainerExtraCheckboxes]) {
            const dataStatus = {
                areas: this._schedules[idContainerExtraCheckboxes].CHILD_ACCESS == '1',
                users: this._schedules[idContainerExtraCheckboxes].USER_ACCESS == '1',
                main: {
                    status: node.selected,
                    el: node.li
                }
            }
            if (dataStatus.main.status && ((dataStatus.areas && !dataStatus.users) || (!dataStatus.areas && dataStatus.users) || (!dataStatus.areas && !dataStatus.users))) {
                $(dataStatus.main.el).find('span.fancytree-node').removeClass('fancytree-selected')
                this.nodeSetPartselSchedules(node, true);
            } else {
                $(dataStatus.main.el).find('span.fancytree-node').addClass('fancytree-selected')
                this.nodeSetPartselSchedules(node, false);
            }
        }


        const parent = node.getParent()
        if (this.checkPartselSchedules(node)) {
            $(node.span).removeClass('fancytree-selected')
            this.nodeSetPartselSchedules(node, true);
            setTimeout(() => {
                $(node.span).removeClass('fancytree-selected')
                this.nodeSetPartselSchedules(node, true);
            }, 100)
        } else {
            $(node.span).addClass('fancytree-selected')
            this.nodeSetPartselSchedules(node, false);
        }
        if (parent.key.indexOf('r') === -1) { // not parent
            if (this.checkPartselSchedules(parent)) {
                $(parent.span).removeClass('fancytree-selected')
                this.nodeSetPartselSchedules(parent, true);
                setTimeout(() => {
                    $(parent.span).removeClass('fancytree-selected')
                    this.nodeSetPartselSchedules(parent, true);
                }, 100)
            } else {
                $(parent.span).addClass('fancytree-selected')
                this.nodeSetPartselSchedules(parent, false);
            }
        }

        this.setSchedules(this._originalSchedules);
        this.onSchedulesClick(null);
        this.schedulesCheckParents(node);
    }

    schedules_recalculateNode(e, node) {
        let target = e.target;
        let dataSet = target.dataset;
        let incType = dataSet['inctype'];
        let isEnabled: boolean = !$(target).hasClass('fancytree-checkboxCheck');

        if (!$(e.target).parent().parent().parent().find('.fancytree-checkbox').eq(0).hasClass('fancytree-checkboxCheck')) {
            $(e.target).parent().parent().parent().find('.fancytree-checkbox').eq(0).addClass('fancytree-checkboxCheck')
            node.setSelected(true);
        }

        if (isEnabled) {
            $(target).addClass('fancytree-checkboxCheck');
        } else {
            $(target).removeClass('fancytree-checkboxCheck');
        }

        this.schedules_updateOrigin(node, incType, isEnabled);
        this.setSchedules(this._originalSchedules);
        this.onSchedulesClick(null);
    }

    schedulesFilter($event) {
        this.filterStr = $event.target.value;
        if ($event.target.value === '') {
            this.schedulesTree.clearFilter();
            this.schedulesTree.getTree().visit(function (node) {
                node.collapseSiblings();
            });
        } else {
            this.schedulesTree.filterCallback($event.target.value, function (str, node) {
                if (node.title != null) {
                    let normTitle = str.toLowerCase();
                    let normNodeTitle = node.title.toLowerCase();
                    return (normNodeTitle.indexOf(normTitle) !== -1);
                }

                return false;
            });
        }
    }

    private schedules_updateOrigin(node: any, incType: 'users' | 'areas', isEnabled: boolean = false) {
        let schNode: LookupLocationType = node.data.dirtyObj;
        if (isEnabled === true) {
            let isEnabledStr = '1';
            let isSetTargetSch: boolean = false;
            $.each(this._originalSchedules, (k, originSch: SchedulesAreasType) => {
                if (originSch.AREA_ID === schNode.ID) {
                    isSetTargetSch = true;
                    if (incType === 'users') {
                        this._originalSchedules[k].USER_ACCESS = isEnabledStr;
                    } else {
                        this._originalSchedules[k].CHILD_ACCESS = isEnabledStr;
                    }
                }
            });

            if (isSetTargetSch === false) {
                if (incType === 'areas') {
                    this._originalSchedules.push(<SchedulesAreasType>{
                        AREA_ID: schNode.ID,
                        CHILD_ACCESS: isEnabledStr,
                        USER_ACCESS: '0'
                    });
                } else if (incType === 'users') {
                    this._originalSchedules.push(<SchedulesAreasType>{
                        AREA_ID: schNode.ID,
                        CHILD_ACCESS: '0',
                        USER_ACCESS: isEnabledStr
                    });
                }
            }
        } else {
            let isEnabledStr = '0';
            this._originalSchedules = this._originalSchedules.map((originSch: SchedulesAreasType) => {
                if (originSch.AREA_ID === schNode.ID) {
                    if (incType === 'areas') {
                        originSch.CHILD_ACCESS = isEnabledStr;
                    } else if (incType === 'users') {
                        originSch.USER_ACCESS = isEnabledStr;
                    }
                }

                return originSch;
            });
        }
        this._originalSchedules = this._originalSchedules.filter((originSch: SchedulesAreasType) => {
            return originSch != null;
        });
        this.onUpdateSchedules.emit(this.filterDuplicates(this._originalSchedules));
    }

    /**
     * ***************************************************************************************
     */

    /**
     * RESPONSIBILITY
     */

    responsibility_onClick($event) {
        console.log('CLICK responsibility_onClick');
        $event.data.node.dont_update_title = true;
        this.responsibilityUpdateTree();
    }

    responsibilityUpdateTree() {
        console.log('responsibilityUpdateTree');
        this.responsibilitiesTree.getTree().rootNode.visit((chNode) => {
            new Promise((resolve) => {
                resolve();
            }).then(
                () => {
                    if (chNode.key === "26") {
                        debugger
                    }
                    if (chNode.key === "62") {
                        debugger
                    }
                    if (chNode.notUpdatePartselCustomStatus !== true) {
                        this.responsibilityCheckParents(chNode);
                    }

                    chNode.notUpdatePartselCustomStatus = false

                    if(!chNode.data.dirtyObj) {
                        return;
                    }
                    switch (chNode.partselCustomStatus) {
                        case 'partsel':
                            $(chNode.span).addClass('fancytree-partsel')
                            $(chNode.span).removeClass('fancytree-selected')
                            chNode.selected = true;
                            chNode.data.dirtyObj.IS_SELECTED = true;
                            break;
                        case 'unselect':
                            $(chNode.span).find('.fancytree-checkbox').removeClass('fancytree-checkboxCheck')
                            $('#' + chNode.key).find('.fancytree-checkbox').removeClass('fancytree-checkboxCheck')
                            chNode.selected = false;
                            chNode.data.dirtyObj.IS_SELECTED = false;
                            chNode.data.dirtyObj.PERMISSION.VALUE = 0;
                            break;
                        case 'select':
                            $(chNode.span).find('.fancytree-checkbox').addClass('fancytree-checkboxCheck')
                            $(chNode.span).addClass('fancytree-partsel fancytree-selected')
                            chNode.selected = true;
                            chNode.data.dirtyObj.IS_SELECTED = true;
                            chNode.data.dirtyObj.PERMISSION.VALUE = chNode.data.dirtyObj.PERMISSION.MASK;
                            break;
                    }
                    if (chNode.needToAllSelected) {
                        chNode.needToAllSelected = false;
                        chNode.selected = true;
                        chNode.partselCustomStatus = 'select';
                        chNode.data.dirtyObj.IS_SELECTED = true;
                        chNode.data.dirtyObj.PERMISSION.VALUE = chNode.data.dirtyObj.PERMISSION.MASK;
                        $(chNode.span).find('.fancytree-checkbox').addClass('fancytree-checkboxCheck');
                        $(chNode.span).addClass('fancytree-partsel fancytree-selected');
                        $('#' + chNode.key).find('.fancytree-checkbox').addClass('fancytree-checkboxCheck');
                        const parent = chNode.getParent();
                        if (parent.getChildren().length === 1) {
                            parent.partselCustomStatus === parent.data.dirtyObj.PERMISSION.MASK !== chNode.data.dirtyObj.PERMISSION.VALUE ? 'partsel' : 'select';
                            parent.selected = true;
                            parent.data.dirtyObj.IS_SELECTED = true;
                            const classNames = parent.partselCustomStatus === 'partsel' ? 'fancytree-partsel' : 'fancytree-partsel fancytree-selected'
                            $(parent.span).find('.fancytree-checkbox').addClass('fancytree-checkboxCheck')
                            $(parent.span).addClass(classNames)

                        }

                        this.delayedupdate()
                    }
                });
        });
    }

    public inputTimeout;
    delayedupdate(tm = 50) {
        if (this.inputTimeout) {
            clearTimeout(this.inputTimeout);
        }

        this.inputTimeout = setTimeout(() => {
            this.responsibilityUpdateTree();
        }, tm);
    }

    responsibility_onSelectNode($event, type) {
        console.log('responsibility_onSelectNode');
        if (this.responsibilitiesModThree) {
            return
        }

        let node = $event.data.node;
        let nodeRes: ResponsibilitiesType = node.data.dirtyObj;
        nodeRes.IS_SELECTED = node.isSelected();

        if (!nodeRes.IS_SELECTED) {
            $('#' + node.key + ' span').removeClass('fancytree-checkboxCheck');
            nodeRes.PERMISSION.VALUE = 0;
        }

        node.visit((node) => {
            $.each(this._originalResponsibilities, (k, rsp: ResponsibilitiesType) => {
                if (node.data.dirtyObj.RESPONSIBILITY_ID === rsp.RESPONSIBILITY_ID) {
                    this._originalResponsibilities[k].IS_SELECTED = node.isSelected();
                    return false;
                }
            });
        });
        this.responsibility_updateOrigin(nodeRes);

        if (type === 'select') {
            this.responsibilityCheckParents(node);
        } else if (type === 'unselect' && node.partselCustomStatus === 'partsel') {
            this.responsibilitySetAllAfterPartsel(node);
        }
        this.responsibilityUpdateTree();
    }

    responsibility_recalculateNode(e, node) {
        console.log('responsibility_recalculateNode');
        let target = e.target;
        let dataSet = target.dataset;
        let perType = dataSet['pertype'];
        let nodeRes: ResponsibilitiesType = node.data.dirtyObj;
        let val = node.data.dirtyObj.PERMISSION.VALUE;
        let isEnabled: boolean = $(target).hasClass('fancytree-checkboxCheck');
        $(target).toggleClass('fancytree-checkboxCheck');
        let byte: number = 0;
        if (perType == 'read') {
            byte = this.byteRead;
        }
        if (perType == 'modify') {
            byte = this.byteModify;
        }
        if (perType == 'delete') {
            byte = this.byteDelete;
        }

        if (isEnabled) {
            val -= byte;
        } else {
            val += byte;
        }
        nodeRes.PERMISSION.VALUE = val;

        if (!$(node.span).find('.fancytree-checkbox').hasClass('fancytree-checkboxCheck')) {
            $(node.span).find('.fancytree-checkbox').addClass('fancytree-checkboxCheck')
            node.setSelected(true);
        }
        const extraFiledStatus = this.getSelectedExtraField(node);

        if (extraFiledStatus.isAllSelected) {
            // this.
        }

        this.responsibility_updateOrigin(nodeRes);
        this.responsibilityCheckParents(node);
        this.responsibilityUpdateTree();
    }

    responsibilitySetAllAfterPartsel(node) {
        node.needToAllSelected = true;
        node.partselCustomStatus = 'select'
        if (node.getChildren()) {
            const childId = [node]

            const foundAllChildren = (ar) => {
                if (ar && ar.children) {
                    ar.children.forEach(el => {
                        childId.push(el)
                        if (el.children && el.children.length > 0) {
                            foundAllChildren(el)
                        }
                    });
                }

            }

            foundAllChildren(node)

            childId.forEach((chNode, i) => {
                chNode.needToAllSelected = true;
                chNode.partselCustomStatus = 'select'
            })
        }
        node.getParentList().forEach(prNode => {
            prNode.notUpdatePartselCustomStatus = true;
        })
    }

    /**
     * Выполняется после всех манипуляций как библиотекой так и записей в respons
     * @param node
     */
    responsibilityCheckParents(node) {
        if (node.key.indexOf('r') === 0) {
            return false
        }
        if (node.key === '11809') {
            // debugger
        }

        const childId = [node]

        const foundAllChildren = (ar) => {
            if (ar && ar.children) {
                ar.children.forEach(el => {
                    childId.push(el)
                    if (el.children && el.children.length > 0) {
                        foundAllChildren(el)
                    }
                });
            }

        }
        const obj = node.data.dirtyObj;

        let countAdditionalSelected = 0;
        let countAdditionalDeSelected = 0;
        let countNodeDeSelected = 0;

        foundAllChildren(node)

        childId.forEach((chNode, i) => {
            const statusNode = this.getSelectedExtraField(chNode);
            if (statusNode.isAllSelected) {
                countAdditionalSelected++;
            } else {
                countAdditionalDeSelected++;
            }
            if (!chNode.selected) {
                countNodeDeSelected++
            }
        })

        if (countAdditionalDeSelected === 0 && countNodeDeSelected === 0) {
            node.partselCustomStatus = 'select';
            // console.log(node.partselCustomStatus);
            return
        }

        if (childId.length === countNodeDeSelected) {
            node.partselCustomStatus = 'unselect';
            // console.log(node.partselCustomStatus);
            return
        }

        if (countAdditionalDeSelected > 0 || countNodeDeSelected > 0) {
            node.partselCustomStatus = 'partsel';
            // console.log(node.partselCustomStatus);
            return
        }


    }

    responsibility_onRenderNode($event) {
        console.log('responsibility_onRenderNode', $event.data.node);
        // let self = this;
        let data = $event.data;
        let node = data.node;

        if (node.parent.parent === null) {
            node.unselectable = false;
            node.setSelected(node.isSelected());
            node.unselectable = true;
            // $(node.span).addClass('fancytree-unselectable')
        }

        let $span = $(node.span);
        let dirtyObj = node.data.dirtyObj;
        if (!dirtyObj || !dirtyObj.PERMISSION) {
            return;
        }
        if (node.title && this.filterStr && node.title.toLocaleLowerCase().indexOf(this.filterStr) === -1) {
            let $spanPerm = $span.parent().find(('div.additional-block#' + node.key)).eq(0);
            if ($spanPerm.length) {
                $spanPerm.remove();
            }
            return true;
        }
        // 1 - read
        // 2 - modify
        // 4 - delete
        let byteRead: any = (this.byteRead).toString(16);
        let byteModify: any = (this.byteModify).toString(16);
        let byteDelete: any = (this.byteDelete).toString(16);

        let mask: number = dirtyObj.PERMISSION.MASK;
        let val = dirtyObj.PERMISSION.VALUE;
        $span.css({
            paddingTop: 3,
            paddingBottom: 3
        });

        // readonly
        let activeCheckboxEl = '';
        if (this.isReadonly) {
            activeCheckboxEl = 'fancytree-disabled';
        }
        let $fancytreeTitle = $span.find('.fancytree-title');
        if (data.node.data.dirtyObj.DESCRIPTION || this._debugIDShowed) {
            $fancytreeTitle.html($fancytreeTitle.text() + '<i class="icon icons-info fancytree-info" title="' + (this._debugIDShowed ? "(" + data.node.data.dirtyObj.PERM_ID + ") " : "") + dirtyObj.DESCRIPTION + '"></i>');
        }
        if (node.data.dirtyObj.PERMISSION.MASK !== 0) {
            if (!$span.parent().find('div.additional-block#' + node.key).length) {
                $span.parent().append('<div class="additional-block" id="' + node.key + '"></div>');
            }
            let $spanPerm = $span.parent().find(('div.additional-block#' + node.key));
            //$spanPerm.css("left", self.maxWidth + 50);
            $spanPerm.empty();
            if (byteRead & mask) {
                let statusCheckboxEl = ((byteRead & val) ? 'fancytree-checkboxCheck' : '');
                $spanPerm.append(
                    '<span class="mask-checkboxes">' +
                    '<span data-pertype="read" class="fancytree-checkbox imfx-fancytree-checkbox-custom ' + activeCheckboxEl + ' ' + statusCheckboxEl + '"></span> Read/View ' +
                    '</span> '
                );
            }

            if (byteModify & mask) {
                let statusCheckboxEl = ((byteModify & val) ? 'fancytree-checkboxCheck' : '');
                $spanPerm.append(
                    '<span class="mask-checkboxes">' +
                    '<span data-pertype="modify" class="fancytree-checkbox imfx-fancytree-checkbox-custom ' + activeCheckboxEl + ' ' + statusCheckboxEl + '"></span> Create/Modify ' +
                    '</span> '
                );
            }

            if (byteDelete & mask) {
                let statusCheckboxEl = ((byteDelete & val) ? 'fancytree-checkboxCheck' : '');
                $spanPerm.append(
                    '<span class="mask-checkboxes">' +
                    '<span data-pertype="delete" class="fancytree-checkbox imfx-fancytree-checkbox-custom ' + activeCheckboxEl + ' ' + statusCheckboxEl + '"></span> Delete/Remove ' +
                    '</span>'
                );
            }

            if (!this.isReadonly) {
                $($spanPerm).find('span[data-pertype]').unbind().bind('click', (e: JQueryEventObject | any) => {
                    this.responsibility_recalculateNode(e, node);
                });
            }
        }

        // for avoid freezing. setTimeout schedule so much tasks (px-4145)
        if (!this.responsibility_expandCollaps_isPlanning) {
            this.responsibility_expandCollaps_isPlanning = true;
            setTimeout(() => {
                if (this.destroyed$.isStopped) {
                    return;
                }
                this.responsibility_expandCollaps_isPlanning = false;
                this.responsibility_expandCollaps();
            });
        }
        this.delayedupdate(100);
    }

    responsibility_expandCollaps() {
        this.on_expandCollaps(".tree-group-permissions.responsibility-tree");
    }

    /**
     *
     * @param node
     * @return {number}: 0 - unselect, 1 - partsel, 2 - select
     */
    getStatusPartSel(node)
        :
        0 | 1 | 2 {
        if (node.key === '11809') {
            debugger
        }

        const childId = [node]

        const foundAllChildren = (ar) => {
            if (ar && ar.children) {
                ar.children.forEach(el => {
                    childId.push(el)
                    if (el.children && el.children.length > 0) {
                        foundAllChildren(el)
                    }
                });
            }

        }

        let allRules = 0;
        let countAdditionalDeSelected = 0;
        let countNodeDeSelected = 0;

        foundAllChildren(node)

        childId.forEach((chNode, i) => {
            const statusNode = this.getSelectedExtraField(chNode);
            if (!statusNode.isAllSelected) {
                countAdditionalDeSelected++;
            }
            if (!chNode.selected) {
                countNodeDeSelected++
            }
        })

        if (countAdditionalDeSelected === 0 && countNodeDeSelected === 0) {
            return 2;
        }

        if (countAdditionalDeSelected !== 0 || countNodeDeSelected !== 0) {
            return 1;
        }

        if (countNodeDeSelected === childId.length) {
            return 0;
        }

    }

    /**
     * read 1
     * modify 2
     * byteDelete 4
     * mask = 15 read modify byteDelete
     * mask = 6 modify byteDelete
     * mask = 7 read modify byteDelete
     * mask = 2 modify
     * @param e
     * @param node
     */
    getSelectedExtraField(node) {
        const obj: ResponsibilitiesType = node.data.dirtyObj;
        const data = {
            isAllSelected: false,
            fields: [],
            fieldsStatus: {
                read: null,
                modify: null,
                delete: null,
            }
        }
        if(!obj || !obj.PERMISSION || obj.PERMISSION.MASK == undefined || obj.PERMISSION.VALUE == undefined) {
            return data;
        }
        const mask = obj.PERMISSION.MASK;
        const val = obj.PERMISSION.VALUE;

        let byteRead: any = (this.byteRead).toString(16);
        let byteModify: any = (this.byteModify).toString(16);
        let byteDelete: any = (this.byteDelete).toString(16);

        const getStatus = (byte) => {
            return byte & mask
        }

        if (getStatus(this.byteRead)) {
            data.fields.push('read');
            data.fieldsStatus.read = (byteRead & val) > 0;
        }
        if (getStatus(this.byteModify)) {
            data.fields.push('modify')
            data.fieldsStatus.modify = (byteModify & val) > 0;
        }
        if (getStatus(this.byteDelete)) {
            data.fields.push('delete');
            data.fieldsStatus.delete = (byteDelete & val) > 0;
        }

        let count = 0;
        data.fields.forEach(flName => {
            if (data.fieldsStatus[flName]) {
                count++
            }
        })
        data.isAllSelected = count === data.fields.length;
        return data;
    }


    public renderTree() {
        this.responsibilitiesTree.setSource(this._responsibilities);
    }

    private filterDuplicates(nodes: any[], field: 'RESPONSIBILITY_ID' | 'AREA_ID' = 'AREA_ID'): any[] /*SchedulesAreasType[]| ResponsibilitiesType[]*/ {
        const index: number[] = [];

        nodes.sort(function (a, b) {
            const t1 = a[field];
            const t2 = b[field];
            if (t1 < t2)
                return -1;
            if (t1 > t2)
                return 1;
            return 0;
        });
        for (let i = nodes.length - 1; i >= 0; i--) {
            if (i < nodes.length - 1) {
                if (nodes[i][field] == nodes[i + 1][field]) {
                    nodes.splice(i + 1, 1);
                }
            }
        }

        return nodes; // forbidden to return a new object (with another link)
    }


    responsibilityFilter($event) {
        this.filterStr = $event.target.value;
        if ($event.target.value === '') {
            this.responsibilitiesTree.clearFilter();
            this.responsibilitiesTree.getTree().visit(function (node) {
                node.collapseSiblings();
            });
        } else {
            this.responsibilitiesTree.filterCallback($event.target.value, function (str, node) {
                if (node.title != null) {
                    let normTitle = str.toLowerCase();
                    let normNodeTitle = node.title.toLowerCase();
                    return (normNodeTitle.indexOf(normTitle) !== -1);
                }

                return false;
            });
        }
    }

    /**
     * *************************************************
     */
    reportsPermissionsFilter($event) {
        this.filterStr = $event.target.value;
        if ($event.target.value === '') {
            this.reportsPermissionsTree.clearFilter();
            this.reportsPermissionsTree.getTree().visit(function (node) {
                node.collapseSiblings();
            });
        } else {
            this.reportsPermissionsTree.filterCallback($event.target.value, function (str, node) {
                if (node.title != null) {
                    let normTitle = str.toLowerCase();
                    let normNodeTitle = node.title.toLowerCase();
                    return (normNodeTitle.indexOf(normTitle) !== -1);
                }

                return false;
            });
        }
    }

    reportsPermissions_onClick($event) {
        $event.data.node.dont_update_title = true;
    }

    reportsPermissions_onSelectNode($event) {
        let node = $event.data.node;
        let nodeRes: ReportsPermissionsType = node.data.dirtyObj;
        nodeRes.IS_SELECTED = $event.data.node.isSelected();
        node.visit((node) => {
            $.each(this._originalReportsPermissions, (k, rsp: ReportsPermissionsType) => {
                if (node.data.dirtyObj.ID === rsp.ID) {
                    this._originalReportsPermissions[k].IS_SELECTED = node.isSelected();
                    return false;
                }
            });
        });
        this.reportsPermissions_updateOrigin(nodeRes);
    }

    reportsPermissions_expandCollaps() {
        this.on_expandCollaps(".tree-group-permissions.reports-permissions-tree");
    }

    reportsPermissions_onRenderNode($event) {
        let data = $event.data;
        let node = data.node;
        node.visit((chNode) => {
            new Promise((resolve) => {
                resolve();
            }).then(
                () => {
                    this.reportsPermissions_onRenderNodeProcess(chNode);
                },
                (err) => {
                    console.log(err);
                }
            );
        });
    }

    reportsPermissions_onRenderNodeProcess(node) {
        let $span = $(node.span);
        let dirtyObj = node.data.dirtyObj;
        if (node.title && this.filterStr && node.title.toLocaleLowerCase().indexOf(this.filterStr) === -1 || node.title.length == 0) {
            return true;
        }

        $span.css({
            paddingTop: 3,
            paddingBottom: 3
        });

        var o = this._originalReportsPermissions.filter((x) => {
            return x.ID == dirtyObj.ID;
        });
        let isSelectedNode = !!(o.length > 0 && o[0].IS_SELECTED);

        if (this.isReadonly) {
            node.unselectable = false;
            node.setSelected(isSelectedNode);
            node.unselectable = true;
        } else {
            node.setSelected(isSelectedNode);
        }

        setTimeout(() => {
            if (this.destroyed$.isStopped) {
                return;
            }
            this.reportsPermissions_expandCollaps();
        });
    }

    deselectAll() {
        $('.jqSelectAll ul.ui-fancytree > li > span').each(function () {
            $(this).find('.fancytree-checkbox.fancytree-checkboxCheck').click();
            // 'span.fancytree-node.fancytree-partsel:not(.fancytree-selected)'
            if ($(this).hasClass('fancytree-partsel')) {
                $(this).find('.fancytree-checkbox').click();
                $(this).find('.fancytree-checkbox').click()
            }
        });
        this.selectAllButton = true;
        this.deselectAllButton = false
    }

    protected selectAll(): void {
        $('.jqSelectAll ul.ui-fancytree > li > span'
        ).each(function () {
            $(this).find('.fancytree-checkbox').not('.fancytree-checkboxCheck').click()
        });
        this.selectAllButton = false;
        this.deselectAllButton = true

    }

    private on_expandCollaps(target) {
        let self = this;
        self.maxWidth = 0;
        let rootOffset = $(target + " .fancytree-container").offset().left;
        $(target + ' span.fancytree-title').each(function () {
            self.maxWidth = $(this).width() > self.maxWidth ? $(this).width() : self.maxWidth;
        });
        $(target + ' div.additional-block').each(function () {
            var offset = self.getOffsetRecursive(this, 0);
            $(this).css("left", self.maxWidth - (offset - rootOffset) + 80);
        });
    }

    private responsibility_updateOrigin(nodeRes: ResponsibilitiesType) {
        $.each(this._originalResponsibilities, (k, orignRes: ResponsibilitiesType) => {
            if (orignRes.RESPONSIBILITY_ID === nodeRes.RESPONSIBILITY_ID) {
                this._originalResponsibilities[k] = nodeRes;
                return false;
            }
        });

        this.onUpdateResponsibility.emit(this.filterDuplicates(this._originalResponsibilities, 'RESPONSIBILITY_ID'));
    }

    private prepareResponsibilitiesList(responsibilities: ResponsibilitiesType[]): TreeStandardListTypes {
        let tmp: TreeStandardIndexedListTypes | any = {};
        let resp: TreeStandardListTypes = [];
        let self = this;
        // indexes
        $.each(responsibilities, (k, obj: ResponsibilitiesType) => {
            tmp[obj.RESPONSIBILITY_ID] = obj;
        });

        // build tree
        $.each(tmp, (k, obj) => {
            if (obj.PARENT_ID !== null && tmp[obj.PARENT_ID]) {
                if (!tmp[obj.PARENT_ID]._children) {
                    tmp[obj.PARENT_ID]._children = [];
                }
                tmp[obj.PARENT_ID]._children.push(obj);
            } else {
                resp.push(obj);
            }

        });

        return resp;
    }

    private prepareReportsPermissionsList(reportsPermissions: ReportsPermissionsType[]): TreeStandardListTypes {
        let tmp: TreeStandardIndexedListTypes | any = {};
        let resp: TreeStandardListTypes = [];
        let self = this;
        // indexes
        $.each(reportsPermissions, (k, obj: ReportsPermissionsType) => {
            tmp[obj.ID] = obj;
        });

        // build tree
        $.each(tmp, (k, obj) => {
            if (obj.PARENT_ID !== null && tmp[obj.PARENT_ID]) {
                if (!tmp[obj.PARENT_ID]._children) {
                    tmp[obj.PARENT_ID]._children = [];
                }
                tmp[obj.PARENT_ID]._children.push(obj);
            } else {
                resp.push(obj);
            }
        });
        return resp;
    }

    private reportsPermissions_updateOrigin(nodeRes: ReportsPermissionsType) {
        $.each(this._originalReportsPermissions, (k, orignRes: ReportsPermissionsType) => {
            if (orignRes.ID === nodeRes.ID) {
                this._originalReportsPermissions[k] = nodeRes;
                return false;
            }
        });

        this.onUpdateReportsPermissions.emit(this._originalReportsPermissions);
    }
}
